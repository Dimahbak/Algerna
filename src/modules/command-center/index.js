/**
 * Module Command-Center — API /api/command-center/overview
 * Alimente le tableau de bord Salle de Commandement (Wali).
 * Accès : superviseur wilaya | cabinet | capacité salle_commandement.
 */
const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { query } = require('../../db/pool');
const router = Router();

function requireCommandCenter() {
  return (req, res, next) => {
    const u = req.user;
    if (!u) return res.status(401).json({ erreur: 'Non authentifié' });
    const isWilaya = u.role === 'admin_wilaya' || (u.fonction === 'superviseur' && u.niveau_perimetre === 'wilaya');
    const isCabinet = u.fonction === 'cabinet';
    const hasCap = Array.isArray(u.capacites) && u.capacites.includes('salle_commandement');
    if (isWilaya || isCabinet || hasCap) return next();
    return res.status(403).json({ erreur: 'Accès réservé à la Salle de Commandement' });
  };
}

// ── GET /overview ──
// Filtres optionnels : ?period=today|7d|30d  ?severity=critical
router.get('/overview', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const period = req.query.period || '30d';
    const severity = req.query.severity;

    // Period filter SQL
    const periodMap = { today: '1 day', '7d': '7 days', '30d': '30 days' };
    const interval = periodMap[period] || '30 days';
    const periodWhere = `AND s.cree_le >= NOW() - INTERVAL '${interval}'`;

    // Severity filter
    const severityWhere = severity === 'critical' ? "AND (s.gravite = 'danger_immediat' OR cs.criticite = 'haute')" : '';

    // ── SUMMARY ──
    // DÉFINITION UNIQUE "CRITIQUE" : gravite = 'danger_immediat' ET actif
    //
    // STOCK vs FLUX (décision Hamid) :
    //   STOCK (tous les actifs, sans fenêtre) : criticalCases, breachedSla,
    //     communesUnderWatch, slaRespect, inverseCritiques, mobilizedOrganisations
    //   FLUX (fenêtre période) : tauxTraitement, tauxReponse

    // STOCK — anomalies : tous les dossiers actifs sans filtre période
    const { rows: [stock] } = await query(`
      SELECT
        COUNT(*) FILTER (WHERE s.gravite = 'danger_immediat') AS critical_cases,
        COUNT(*) FILTER (WHERE cs.criticite = 'haute') AS high_priority_cases,
        COUNT(DISTINCT s.commune_id) AS communes_under_watch,
        COUNT(*) FILTER (WHERE s.cree_le < NOW() - INTERVAL '48 hours') AS breached_sla,
        COUNT(*) AS active
      FROM signalement s
      JOIN categorie_signal cs ON cs.id = s.categorie_id
      WHERE s.etat NOT IN ('resolu','clos','rejete') ${severityWhere}
    `);

    // FLUX — taux d'activité : fenêtre période
    const { rows: [flux] } = await query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE s.etat IN ('resolu','clos')) AS resolved,
        COUNT(*) FILTER (WHERE s.etat NOT IN ('resolu','clos','rejete','recu')) AS responded
      FROM signalement s
      JOIN categorie_signal cs ON cs.id = s.categorie_id
      WHERE 1=1 ${periodWhere} ${severityWhere}
    `);

    const { rows: [decisionCount] } = await query("SELECT COUNT(*) AS n FROM demo_decisions WHERE statut = 'en_attente'");

    // Mobilized organisations (STOCK)
    const { rows: mobilized } = await query(`
      SELECT DISTINCT o.id, o.nom, o.type_organisation FROM organisations o
      WHERE o.id IN (
        SELECT direction_pilote_id FROM signalement WHERE etat NOT IN ('resolu','clos','rejete') AND direction_pilote_id IS NOT NULL
        UNION
        SELECT organisation_executante_id FROM signalement WHERE etat NOT IN ('resolu','clos','rejete') AND organisation_executante_id IS NOT NULL
      )
    `);

    // Score — composantes documentées :
    //   slaRespect (STOCK) : (actifs - SLA dépassés) / actifs × 100
    //   tauxTraitement (FLUX) : résolus / total_période × 100
    //   tauxReponse (FLUX) : actifs ayant reçu action / actifs_période × 100
    //   inverseCritiques (STOCK) : 100 - critiques × 20, plancher 0
    //   inverseDecisions (STOCK) : 100 - décisions_en_attente × 15, plancher 0
    const active = parseInt(stock.active) || 0;
    const breached = parseInt(stock.breached_sla) || 0;
    const critical = parseInt(stock.critical_cases) || 0;
    const fluxTotal = parseInt(flux.total) || 1;
    const fluxResolved = parseInt(flux.resolved) || 0;
    const fluxResponded = parseInt(flux.responded) || 0;
    const fluxActive = fluxTotal - fluxResolved - (parseInt(flux.total) - parseInt(flux.resolved) - parseInt(flux.responded));
    const pendingDec = parseInt(decisionCount.n) || 0;

    const slaRespect = active > 0 ? Math.max(0, (active - breached) / active * 100) : 100;
    const tauxTraitement = fluxTotal > 0 ? (fluxResolved / fluxTotal * 100) : 0;
    const tauxReponse = (fluxTotal - fluxResolved) > 0 ? (fluxResponded / (fluxTotal - fluxResolved) * 100) : 100;
    const inverseCritiques = Math.max(0, 100 - (critical * 20));
    const inverseDecisions = Math.max(0, 100 - (pendingDec * 15));

    const operationalScore = Math.round(
      slaRespect * 0.30 + tauxTraitement * 0.25 + tauxReponse * 0.20 +
      inverseCritiques * 0.15 + inverseDecisions * 0.10
    );

    const summary = {
      criticalCases: critical,
      highPriorityCases: parseInt(stock.high_priority_cases),
      communesUnderWatch: parseInt(stock.communes_under_watch),
      breachedSla: breached,
      pendingDecisions: pendingDec,
      operationalScore,
      mobilizedOrganisations: mobilized.length,
      scoreDetails: {
        slaRespect: Math.round(slaRespect),
        tauxTraitement: Math.round(tauxTraitement),
        tauxReponse: Math.round(tauxReponse),
        inverseCritiques: Math.round(inverseCritiques),
        inverseDecisions: Math.round(inverseDecisions),
        weights: { slaRespect: 0.30, tauxTraitement: 0.25, tauxReponse: 0.20, inverseCritiques: 0.15, inverseDecisions: 0.10 }
      }
    };

    // ── PRIORITIES ── (top 5 critical/overdue)
    const { rows: priorities } = await query(`
      SELECT s.reference, s.description AS titre, s.gravite AS criticite,
             s.lat, s.lng,
             c.nom AS commune, d.nom AS daira,
             dp.nom AS "directionPilote", oe.nom AS executant,
             EXTRACT(EPOCH FROM (NOW() - s.cree_le - INTERVAL '48 hours'))/60 AS "slaDepassementMinutes"
      FROM signalement s
      LEFT JOIN commune c ON c.id = s.commune_id
      LEFT JOIN daira d ON d.id = s.daira_id
      LEFT JOIN organisations dp ON dp.id = s.direction_pilote_id
      LEFT JOIN organisations oe ON oe.id = s.organisation_executante_id
      JOIN categorie_signal cs ON cs.id = s.categorie_id
      WHERE s.etat NOT IN ('resolu','clos','rejete') ${periodWhere}
      ORDER BY
        CASE WHEN s.gravite='danger_immediat' THEN 0 WHEN cs.criticite='haute' THEN 1 ELSE 2 END,
        (NOW() - s.cree_le) DESC,
        s.cree_le ASC
      LIMIT 5
    `);
    priorities.forEach(p => { p.slaDepassementMinutes = Math.max(0, Math.round(p.slaDepassementMinutes || 0)); });

    // ── MAP INCIDENTS ── all active incidents with coordinates
    const { rows: mapIncidents } = await query(`
      SELECT s.reference, s.lat, s.lng, s.gravite, cs.criticite, c.nom AS commune, s.etat
      FROM signalement s
      JOIN categorie_signal cs ON cs.id = s.categorie_id
      LEFT JOIN commune c ON c.id = s.commune_id
      WHERE s.etat NOT IN ('resolu','clos','rejete')
        AND s.lat IS NOT NULL AND s.lng IS NOT NULL
    `);

    // ── RISK ZONES ── top 5 communes by active incident count
    const { rows: riskZones } = await query(`
      SELECT c.id, c.nom, c.nom_ar, c.centre_lat AS lat, c.centre_lng AS lng,
             COUNT(*) AS incidents,
             COUNT(*) FILTER (WHERE s.gravite = 'danger_immediat') AS critiques
      FROM signalement s
      JOIN commune c ON c.id = s.commune_id
      WHERE s.etat NOT IN ('resolu','clos','rejete')
      GROUP BY c.id, c.nom, c.nom_ar, c.centre_lat, c.centre_lng
      ORDER BY critiques DESC, incidents DESC
      LIMIT 5
    `);

    // ── TERRITORY ──
    const { rows: [terr] } = await query(`
      SELECT
        (SELECT COUNT(*) FROM daira) AS "dairasTotal",
        (SELECT COUNT(*) FROM commune) AS "apcTotal",
        (SELECT COUNT(DISTINCT c.id) FROM commune c
         LEFT JOIN signalement s ON s.commune_id = c.id AND s.etat NOT IN ('resolu','clos','rejete') AND s.cree_le >= NOW() - INTERVAL '48 hours'
         WHERE s.id IS NULL AND c.id IN (SELECT commune_id FROM signalement WHERE commune_id IS NOT NULL)
        ) AS "apcNoResponse",
        (SELECT COUNT(DISTINCT s.daira_id) FROM signalement s WHERE s.etat NOT IN ('resolu','clos','rejete') AND s.daira_id IS NOT NULL) AS "dairasConcernees"
    `);
    const territory = { ...terr, coordinationDelays: [] };

    // ── DIRECTIONS ──
    const { rows: directions } = await query(`
      SELECT dp.id, dp.nom,
             COUNT(*) FILTER (WHERE s.etat NOT IN ('resolu','clos','rejete')) AS ouverts,
             COUNT(*) FILTER (WHERE s.gravite='danger_immediat' OR cs.criticite='haute') AS critiques,
             COUNT(*) FILTER (WHERE s.etat NOT IN ('resolu','clos','rejete') AND s.cree_le < NOW() - INTERVAL '48 hours') AS "slaDepasses",
             CASE WHEN COUNT(*)>0 THEN ROUND(COUNT(*) FILTER (WHERE s.etat IN ('resolu','clos'))::numeric / COUNT(*) * 100) ELSE 0 END AS "tauxTraitement"
      FROM signalement s
      JOIN categorie_signal cs ON cs.id = s.categorie_id
      JOIN organisations dp ON dp.id = s.direction_pilote_id
      WHERE 1=1 ${periodWhere}
      GROUP BY dp.id, dp.nom
      ORDER BY ouverts DESC
    `);

    // ── EPICS ── organisations type_organisation='epic'
    // priorityEpics = prioritaire=true, otherEpics = le reste
    // Directions n'apparaissent QUE dans le bloc directions
    const { rows: epicOrgs } = await query(`
      SELECT o.id, o.nom, o.nom_ar, o.prioritaire, o.ordre_affichage,
             t.nom AS tutelle,
             (SELECT COUNT(*) FROM signalement s WHERE s.organisation_executante_id = o.id AND s.etat NOT IN ('resolu','clos','rejete')) AS ouverts,
             (SELECT COUNT(*) FROM signalement s WHERE s.organisation_executante_id = o.id) AS total_dossiers,
             (SELECT COUNT(*) FROM signalement s WHERE s.organisation_executante_id = o.id AND s.gravite = 'danger_immediat' AND s.etat NOT IN ('resolu','clos','rejete')) AS critiques,
             (SELECT COUNT(*) FROM signalement s WHERE s.organisation_executante_id = o.id AND s.cree_le < NOW() - INTERVAL '48 hours' AND s.etat NOT IN ('resolu','clos','rejete')) AS sla_depasses,
             (SELECT CASE WHEN COUNT(*) FILTER (WHERE s2.etat NOT IN ('resolu','clos','rejete')) > 0
                     THEN ROUND(COUNT(*) FILTER (WHERE s2.etat NOT IN ('resolu','clos','rejete') AND s2.etat <> 'recu')::numeric
                          / COUNT(*) FILTER (WHERE s2.etat NOT IN ('resolu','clos','rejete')) * 100)
                     ELSE 0 END
              FROM signalement s2 WHERE s2.organisation_executante_id = o.id) AS taux_reponse
      FROM organisations o
      LEFT JOIN organisations t ON t.id = o.direction_tutelle_id
      WHERE o.type_organisation = 'epic'
      ORDER BY o.prioritaire DESC, o.ordre_affichage, o.nom
    `);
    const priorityEpics = epicOrgs.filter(e => e.prioritaire).map(e => ({
      id: e.id, nom: e.nom, tutelle: e.tutelle,
      ouverts: parseInt(e.ouverts), totalDossiers: parseInt(e.total_dossiers),
      critiques: parseInt(e.critiques), slaDepasses: parseInt(e.sla_depasses),
      tauxReponse: parseInt(e.taux_reponse)
    }));
    const otherEpics = epicOrgs.filter(e => !e.prioritaire).map(e => ({
      id: e.id, nom: e.nom, tutelle: e.tutelle,
      ouverts: parseInt(e.ouverts), totalDossiers: parseInt(e.total_dossiers),
      critiques: parseInt(e.critiques), slaDepasses: parseInt(e.sla_depasses),
      tauxReponse: parseInt(e.taux_reponse)
    }));

    // ── EXTERNAL PARTNERS ──
    const { rows: partners } = await query("SELECT id, nom, nom_ar, type_organisation, secteur FROM organisations WHERE type_organisation IN ('operateur_externe','partenaire_institutionnel') ORDER BY nom");

    // ── PENDING DECISIONS ──
    const { rows: pendingDecisions } = await query(`
      SELECT dd.id, dd.titre, dd.titre_ar, dd.description, dd.description_ar,
             dd.priorite, dd.statut, dp.nom AS direction,
             dd.is_demo, dd.cree_le
      FROM demo_decisions dd
      LEFT JOIN organisations dp ON dp.id = dd.direction_id
      WHERE dd.statut = 'en_attente'
      ORDER BY CASE dd.priorite WHEN 'haute' THEN 0 WHEN 'moyenne' THEN 1 ELSE 2 END, dd.cree_le
    `);

    // ── DAILY BRIEFING ──
    const { rows: briefings } = await query(`
      SELECT id, titre, titre_ar, contenu, contenu_ar, type, heure
      FROM demo_briefing
      WHERE date_briefing = CURRENT_DATE OR is_demo = TRUE
      ORDER BY heure
    `);
    const dailyBriefing = { date: new Date().toISOString().slice(0, 10), items: briefings };

    // ── RECENT ACTIVITY ── (6 derniers événements réels)
    const { rows: recentActivity } = await query(`
      SELECT sh.action, sh.etat, sh.commentaire, sh.le,
             s.reference, u.prenom AS agent_prenom, u.nom AS agent_nom
      FROM signalement_historique sh
      JOIN signalement s ON s.id = sh.signalement_id
      LEFT JOIN utilisateur u ON u.id = sh.par_utilisateur
      ORDER BY sh.le DESC LIMIT 6
    `);

    res.json({
      summary,
      priorities,
      mapIncidents,
      riskZones,
      territory,
      directions,
      priorityEpics,
      otherEpics,
      externalPartners: partners,
      pendingDecisions,
      dailyBriefing,
      recentActivity,
    });
  } catch (e) {
    console.error('[command-center]', e.message);
    res.status(500).json({ erreur: e.message });
  }
});

module.exports = router;
