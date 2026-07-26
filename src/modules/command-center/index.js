/**
 * Module Command-Center — API /api/command-center/overview
 * Alimente le tableau de bord Salle de Commandement (Wali).
 * Accès : superviseur wilaya | cabinet | capacité salle_commandement.
 */
const { Router } = require('express');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../../middleware/auth');
const { query } = require('../../db/pool');
const router = Router();
const FONT_DIR = path.join(__dirname, '../../../public/assets/fonts');

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

    // ── PRIORITIES ── (top 5 critical/overdue, urgence_wali first)
    const { rows: priorities } = await query(`
      SELECT s.reference, s.description AS titre, s.gravite AS criticite,
             s.urgence_wali,
             s.lat, s.lng,
             c.nom AS commune, d.nom AS daira,
             dp.nom AS "directionPilote", dp.nom_ar AS "directionPiloteAr",
             oe.nom AS executant, oe.nom_ar AS "executantAr",
             EXTRACT(EPOCH FROM (NOW() - s.cree_le - INTERVAL '48 hours'))/60 AS "slaDepassementMinutes"
      FROM signalement s
      LEFT JOIN commune c ON c.id = s.commune_id
      LEFT JOIN daira d ON d.id = s.daira_id
      LEFT JOIN organisations dp ON dp.id = s.direction_pilote_id
      LEFT JOIN organisations oe ON oe.id = s.organisation_executante_id
      JOIN categorie_signal cs ON cs.id = s.categorie_id
      WHERE s.etat NOT IN ('resolu','clos','rejete') ${periodWhere}
      ORDER BY
        CASE WHEN s.urgence_wali THEN 0 ELSE 1 END,
        CASE WHEN s.gravite='danger_immediat' THEN 0 WHEN cs.criticite='haute' THEN 1 ELSE 2 END,
        (NOW() - s.cree_le) DESC,
        s.cree_le ASC
      LIMIT 5
    `);
    priorities.forEach(p => { p.slaDepassementMinutes = Math.max(0, Math.round(p.slaDepassementMinutes || 0)); });

    // ── MAP INCIDENTS ── all active incidents with coordinates
    const { rows: mapIncidents } = await query(`
      SELECT s.reference, s.lat, s.lng, s.gravite, cs.criticite, c.nom AS commune, s.etat,
             dp.nom AS direction_pilote, dp.nom_ar AS direction_pilote_ar, dp.id AS direction_pilote_id,
             oe.nom AS organisation_executante, oe.nom_ar AS organisation_executante_ar, oe.id AS organisation_executante_id,
             oe.type_organisation AS organisation_type
      FROM signalement s
      JOIN categorie_signal cs ON cs.id = s.categorie_id
      LEFT JOIN commune c ON c.id = s.commune_id
      LEFT JOIN organisations dp ON dp.id = s.direction_pilote_id
      LEFT JOIN organisations oe ON oe.id = s.organisation_executante_id
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
      SELECT dp.id, dp.nom, dp.nom_ar,
             COUNT(*) FILTER (WHERE s.etat NOT IN ('resolu','clos','rejete')) AS ouverts,
             COUNT(*) FILTER (WHERE s.gravite='danger_immediat' AND s.etat NOT IN ('resolu','clos','rejete')) AS critiques,
             COUNT(*) FILTER (WHERE s.etat NOT IN ('resolu','clos','rejete') AND s.cree_le < NOW() - INTERVAL '48 hours') AS "slaDepasses",
             CASE WHEN COUNT(*)>0 THEN ROUND(COUNT(*) FILTER (WHERE s.etat IN ('resolu','clos'))::numeric / COUNT(*) * 100) ELSE 0 END AS "tauxTraitement"
      FROM signalement s
      JOIN categorie_signal cs ON cs.id = s.categorie_id
      JOIN organisations dp ON dp.id = s.direction_pilote_id
      WHERE 1=1 ${periodWhere}
      GROUP BY dp.id, dp.nom, dp.nom_ar
      ORDER BY ouverts DESC
    `);

    // ── EPICS ── organisations type_organisation='epic'
    // priorityEpics = prioritaire=true, otherEpics = le reste
    // Directions n'apparaissent QUE dans le bloc directions
    const { rows: epicOrgs } = await query(`
      SELECT o.id, o.nom, o.nom_ar, o.prioritaire, o.ordre_affichage,
             t.nom AS tutelle, t.nom_ar AS tutelle_ar,
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
      id: e.id, nom: e.nom, nom_ar: e.nom_ar, tutelle: e.tutelle, tutelle_ar: e.tutelle_ar,
      ouverts: parseInt(e.ouverts), totalDossiers: parseInt(e.total_dossiers),
      critiques: parseInt(e.critiques), slaDepasses: parseInt(e.sla_depasses),
      tauxReponse: parseInt(e.taux_reponse)
    }));
    const otherEpics = epicOrgs.filter(e => !e.prioritaire).map(e => ({
      id: e.id, nom: e.nom, nom_ar: e.nom_ar, tutelle: e.tutelle, tutelle_ar: e.tutelle_ar,
      ouverts: parseInt(e.ouverts), totalDossiers: parseInt(e.total_dossiers),
      critiques: parseInt(e.critiques), slaDepasses: parseInt(e.sla_depasses),
      tauxReponse: parseInt(e.taux_reponse)
    }));

    // ── EXTERNAL PARTNERS ──
    const { rows: partners } = await query("SELECT id, nom, nom_ar, type_organisation, secteur, description, description_ar, telephone, telephone_urgence, site_web FROM organisations WHERE type_organisation IN ('operateur_externe','partenaire_institutionnel') ORDER BY nom");

    // ── PENDING DECISIONS ──
    const { rows: pendingDecisions } = await query(`
      SELECT dd.id, dd.titre, dd.titre_ar, dd.description, dd.description_ar,
             dd.priorite, dd.statut, dp.nom AS direction, dp.nom_ar AS direction_ar,
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

// ── GET /detail/:type/:id — drilldown pour directions, EPIC, communes, daïras ──
router.get('/detail/:type/:id', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const { type, id } = req.params;
    let rows = [];
    if (type === 'direction') {
      ({ rows } = await query(`
        SELECT s.reference, s.description AS titre, s.etat, s.gravite, c.nom AS commune,
               EXTRACT(EPOCH FROM (NOW() - s.cree_le - INTERVAL '48 hours'))/60 AS "slaMin"
        FROM signalement s LEFT JOIN commune c ON c.id = s.commune_id
        WHERE s.direction_pilote_id = $1 AND s.etat NOT IN ('resolu','clos','rejete')
        ORDER BY s.cree_le DESC
      `, [Number(id)]));
    } else if (type === 'epic') {
      ({ rows } = await query(`
        SELECT s.reference, s.description AS titre, s.etat, s.gravite, c.nom AS commune,
               EXTRACT(EPOCH FROM (NOW() - s.cree_le - INTERVAL '48 hours'))/60 AS "slaMin"
        FROM signalement s LEFT JOIN commune c ON c.id = s.commune_id
        WHERE s.organisation_executante_id = $1 AND s.etat NOT IN ('resolu','clos','rejete')
        ORDER BY s.cree_le DESC
      `, [Number(id)]));
    } else if (type === 'dairas') {
      ({ rows } = await query(`
        SELECT d.id, d.nom, d.nom_ar,
               COUNT(s.id) FILTER (WHERE s.etat NOT IN ('resolu','clos','rejete')) AS incidents
        FROM daira d LEFT JOIN signalement s ON s.daira_id = d.id
        GROUP BY d.id, d.nom, d.nom_ar ORDER BY incidents DESC, d.nom
      `));
    } else if (type === 'communes') {
      ({ rows } = await query(`
        SELECT c.id, c.nom, c.nom_ar,
               COUNT(s.id) FILTER (WHERE s.etat NOT IN ('resolu','clos','rejete')) AS incidents
        FROM commune c LEFT JOIN signalement s ON s.commune_id = c.id
        WHERE c.actif = TRUE
        GROUP BY c.id, c.nom, c.nom_ar ORDER BY incidents DESC, c.nom
      `));
    } else if (type === 'partner' || type === 'epic-info') {
      const { rows: [org] } = await query(`
        SELECT o.id, o.nom, o.nom_ar, o.type_organisation, o.secteur, o.description, o.description_ar,
               o.telephone, o.telephone_urgence, o.site_web, o.sigle_officiel,
               o.contact_nom, o.contact_fonction, o.contact_telephone, o.contact_email,
               o.direction_concernee_id, o.remarques,
               t.nom AS tutelle, t.nom_ar AS tutelle_ar, dc.nom AS direction_concernee_nom
        FROM organisations o
        LEFT JOIN organisations t ON t.id = o.direction_tutelle_id
        LEFT JOIN organisations dc ON dc.id = o.direction_concernee_id
        WHERE o.id = $1
      `, [Number(id)]);
      const { rows: dossiers } = await query(`
        SELECT s.reference, s.description AS titre, s.etat, c.nom AS commune,
               EXTRACT(EPOCH FROM (NOW() - s.cree_le - INTERVAL '48 hours'))/60 AS "slaMin"
        FROM signalement s LEFT JOIN commune c ON c.id = s.commune_id
        WHERE s.organisation_executante_id = $1 AND s.etat NOT IN ('resolu','clos','rejete')
        ORDER BY s.cree_le DESC LIMIT 20
      `, [Number(id)]);
      // Directions en interface (multi)
      const { rows: directionsInterface } = await query(`
        SELECT odi.direction_id, d.nom, d.nom_ar, odi.principal, odi.a_valider
        FROM organisation_directions_interface odi
        JOIN organisations d ON d.id = odi.direction_id
        WHERE odi.partenaire_id = $1
        ORDER BY odi.principal DESC, d.nom
      `, [Number(id)]);
      return res.json({ organisation: org || null, dossiers, directionsInterface });
    } else if (type === 'daira-incidents') {
      ({ rows } = await query(`
        SELECT s.reference, s.description AS titre, s.etat, s.gravite, c.nom AS commune,
               EXTRACT(EPOCH FROM (NOW() - s.cree_le - INTERVAL '48 hours'))/60 AS "slaMin"
        FROM signalement s LEFT JOIN commune c ON c.id = s.commune_id
        WHERE s.daira_id = $1 AND s.etat NOT IN ('resolu','clos','rejete')
        ORDER BY s.cree_le DESC
      `, [Number(id)]));
    } else if (type === 'commune-incidents') {
      ({ rows } = await query(`
        SELECT s.reference, s.description AS titre, s.etat, s.gravite, c.nom AS commune,
               cs.libelle AS categorie,
               EXTRACT(EPOCH FROM (NOW() - s.cree_le - INTERVAL '48 hours'))/60 AS "slaMin"
        FROM signalement s LEFT JOIN commune c ON c.id = s.commune_id
        LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
        WHERE s.commune_id = $1 AND s.etat NOT IN ('resolu','clos','rejete')
        ORDER BY s.cree_le DESC
      `, [Number(id)]));
    }
    res.json({ rows });
  } catch (e) {
    console.error('[command-center/detail]', e.message);
    res.status(500).json({ erreur: e.message });
  }
});

// ── PATCH /contact/:id — édition contacts + directions en interface ──
router.patch('/contact/:id', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { contact_nom, contact_fonction, contact_telephone, contact_email, remarques, directions } = req.body;
    await query(`
      UPDATE organisations SET
        contact_nom = COALESCE($1, contact_nom),
        contact_fonction = COALESCE($2, contact_fonction),
        contact_telephone = COALESCE($3, contact_telephone),
        contact_email = COALESCE($4, contact_email),
        remarques = COALESCE($5, remarques)
      WHERE id = $6
    `, [contact_nom || null, contact_fonction || null, contact_telephone || null, contact_email || null, remarques || null, id]);
    // Directions en interface (replace all)
    if (Array.isArray(directions)) {
      await query('DELETE FROM organisation_directions_interface WHERE partenaire_id = $1', [id]);
      for (const d of directions) {
        await query(
          'INSERT INTO organisation_directions_interface (partenaire_id, direction_id, principal, a_valider) VALUES ($1, $2, $3, FALSE) ON CONFLICT DO NOTHING',
          [id, Number(d.direction_id), !!d.principal]
        );
      }
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('[command-center/contact]', e.message);
    res.status(500).json({ erreur: e.message });
  }
});

// ── GET /directions-list — liste des directions pour le sélecteur ──
router.get('/directions-list', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const { rows } = await query("SELECT id, nom, nom_ar FROM organisations WHERE type_organisation = 'direction_wilaya' AND actif = TRUE ORDER BY nom");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ erreur: e.message });
  }
});

// ── POST /decisions — créer une décision ──
router.post('/decisions', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const { titre, description, direction_id, priorite } = req.body;
    if (!titre) return res.status(400).json({ erreur: 'Titre requis' });
    const { rows: [row] } = await query(
      `INSERT INTO demo_decisions (titre, description, direction_id, priorite, statut, is_demo, cree_le)
       VALUES ($1, $2, $3, $4, 'en_attente', FALSE, NOW()) RETURNING id`,
      [titre, description || null, direction_id ? Number(direction_id) : null, priorite || 'moyenne']
    );
    res.json({ ok: true, id: row.id });
  } catch (e) { console.error('[cc/decisions]', e.message); res.status(500).json({ erreur: e.message }); }
});

// ── PATCH /decisions/:id — modifier une décision ──
router.patch('/decisions/:id', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { titre, description, direction_id, priorite } = req.body;
    await query(
      `UPDATE demo_decisions SET titre = COALESCE($1, titre), description = COALESCE($2, description),
       direction_id = COALESCE($3, direction_id), priorite = COALESCE($4, priorite) WHERE id = $5`,
      [titre || null, description || null, direction_id ? Number(direction_id) : null, priorite || null, id]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// ── POST /decisions/:id/trancher — marquer comme tranchée ──
router.post('/decisions/:id/trancher', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { note } = req.body;
    if (note) {
      await query(`UPDATE demo_decisions SET statut = 'tranchee', description = description || E'\n— ' || $1 WHERE id = $2`, [note, id]);
    } else {
      await query(`UPDATE demo_decisions SET statut = 'tranchee' WHERE id = $1`, [id]);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// ── POST /briefings — créer un item briefing ──
router.post('/briefings', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const { titre, contenu, heure, type } = req.body;
    if (!titre) return res.status(400).json({ erreur: 'Titre requis' });
    const { rows: [row] } = await query(
      `INSERT INTO demo_briefing (titre, contenu, heure, type, date_briefing, is_demo, cree_le)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, FALSE, NOW()) RETURNING id`,
      [titre, contenu || null, heure || '09:00', type || 'reunion']
    );
    res.json({ ok: true, id: row.id });
  } catch (e) { console.error('[cc/briefings]', e.message); res.status(500).json({ erreur: e.message }); }
});

// ── PATCH /briefings/:id — modifier un item briefing ──
router.patch('/briefings/:id', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { titre, contenu, heure, type } = req.body;
    await query(
      `UPDATE demo_briefing SET titre = COALESCE($1, titre), contenu = COALESCE($2, contenu),
       heure = COALESCE($3, heure), type = COALESCE($4, type) WHERE id = $5`,
      [titre || null, contenu || null, heure || null, type || null, id]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// ── DELETE /briefings/:id — supprimer un item briefing ──
router.delete('/briefings/:id', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    await query('DELETE FROM demo_briefing WHERE id = $1', [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// ── GET /briefing-pdf — export PDF briefing du jour ──
// AR = Puppeteer (HTML→PDF, bidi natif parfait)
// FR = PDFKit   (rendu direct, pas de dépendance Chrome)
router.get('/briefing-pdf', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const isAr = req.query.lang === 'ar';

    // Fetch all data (shared by both renderers)
    const { rows: [stock] } = await query(`
      SELECT COUNT(*) FILTER (WHERE s.gravite = 'danger_immediat') AS critical_cases,
             COUNT(*) FILTER (WHERE s.cree_le < NOW() - INTERVAL '48 hours') AS breached_sla,
             COUNT(*) AS active
      FROM signalement s WHERE s.etat NOT IN ('resolu','clos','rejete')
    `);
    const { rows: [flux] } = await query(`
      SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE s.etat IN ('resolu','clos')) AS resolved
      FROM signalement s WHERE s.cree_le >= NOW() - INTERVAL '30 days'
    `);
    const active = parseInt(stock.active) || 0;
    const breached = parseInt(stock.breached_sla) || 0;
    const critical = parseInt(stock.critical_cases) || 0;
    const fluxTotal = parseInt(flux.total) || 1;
    const fluxResolved = parseInt(flux.resolved) || 0;
    const slaRespect = active > 0 ? Math.max(0, (active - breached) / active * 100) : 100;
    const tauxTraitement = fluxTotal > 0 ? (fluxResolved / fluxTotal * 100) : 0;
    const { rows: [decCount] } = await query("SELECT COUNT(*) AS n FROM demo_decisions WHERE statut = 'en_attente'");
    const pendingDec = parseInt(decCount.n) || 0;
    const inverseCritiques = Math.max(0, 100 - (critical * 20));
    const inverseDecisions = Math.max(0, 100 - (pendingDec * 15));
    const score = Math.round(slaRespect * 0.30 + tauxTraitement * 0.25 + 100 * 0.20 + inverseCritiques * 0.15 + inverseDecisions * 0.10);

    const { rows: priorities } = await query(`
      SELECT s.reference, s.description AS titre, s.gravite, c.nom AS commune,
             dp.nom AS direction, dp.nom_ar AS direction_ar,
             EXTRACT(EPOCH FROM (NOW() - s.cree_le - INTERVAL '48 hours'))/60 AS sla_min
      FROM signalement s LEFT JOIN commune c ON c.id = s.commune_id
      LEFT JOIN organisations dp ON dp.id = s.direction_pilote_id
      WHERE s.etat NOT IN ('resolu','clos','rejete')
      ORDER BY CASE WHEN s.gravite='danger_immediat' THEN 0 ELSE 1 END, (NOW()-s.cree_le) DESC LIMIT 5
    `);
    const { rows: briefings } = await query("SELECT titre, titre_ar, contenu, contenu_ar, type, heure FROM demo_briefing WHERE date_briefing = CURRENT_DATE OR is_demo = TRUE ORDER BY heure");
    const { rows: decisions } = await query(`
      SELECT dd.titre, dd.titre_ar, dd.priorite, dp.nom AS direction, dp.nom_ar AS direction_ar
      FROM demo_decisions dd LEFT JOIN organisations dp ON dp.id = dd.direction_id
      WHERE dd.statut = 'en_attente' ORDER BY CASE dd.priorite WHEN 'haute' THEN 0 ELSE 1 END
    `);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=briefing_' + new Date().toISOString().slice(0,10) + '.pdf');

    if (isAr) {
      // ── RENDU ARABE VIA PUPPETEER (bidi natif) ──
      const puppeteer = require('puppeteer');
      const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      const dateStr = new Date().toLocaleDateString('ar-DZ', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

      // KPI rows
      const kpiRows = [
        ['حوادث حرجة', critical],
        ['تجاوزات المهل', breached],
        ['ملفات نشطة', active],
        ['النتيجة التشغيلية', score + '/100'],
        ['قرارات معلقة', pendingDec]
      ].map(([l,v]) => `<tr><td class="kpi-label">${esc(l)}</td><td class="kpi-value">${esc(String(v))}</td></tr>`).join('');

      // Priority rows
      const prioRows = priorities.map(p => {
        const dir = p.direction_ar || p.direction || '—';
        const sla = Math.max(0, Math.round((p.sla_min || 0) / 60));
        return `<div class="line">${esc(p.reference||'')} — ${esc((p.titre||'').substring(0,60))} — ${esc(dir)}${sla > 0 ? ' <span dir="ltr">(+' + sla + 'h)</span>' : ''}</div>`;
      }).join('');

      // Briefing rows
      const briefRows = briefings.map(b => {
        const t = b.titre_ar || b.titre;
        const c = b.contenu_ar || b.contenu;
        let h = '';
        if (b.heure) h = `<span dir="ltr">${esc(b.heure)}</span> — `;
        return `<div class="line">${h}${esc(t)}</div>` + (c ? `<div class="sub-line">${esc(c)}</div>` : '');
      }).join('');

      // Decision rows
      const decRows = decisions.map(d => {
        const t = d.titre_ar || d.titre;
        const dir = d.direction_ar || d.direction || '—';
        const prio = d.priorite === 'haute' ? '● عالية' : '○ متوسطة';
        return `<div class="line">${esc(prio)} — ${esc(t)} (${esc(dir)})</div>`;
      }).join('');

      const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Naskh Arabic','DejaVu Sans',serif; direction:rtl; color:#333; font-size:10px; line-height:1.6; padding:0 24px; }
  .header { background:#041F38; color:white; padding:14px 24px; margin:0 -24px 16px; }
  .header h1 { font-size:16px; font-weight:700; color:white; margin-bottom:2px; }
  .header .sub { font-size:9px; color:#8ecae6; }
  .title { font-size:14px; font-weight:700; color:#041F38; margin-bottom:4px; }
  .date { font-size:9px; color:#666; margin-bottom:16px; }
  .section { background:#063B5A; color:white; padding:5px 14px; border-radius:3px; font-size:10px; font-weight:700; margin:16px 0 8px; }
  table.kpi { width:auto; border-collapse:collapse; margin-bottom:8px; }
  table.kpi td { padding:4px 16px 4px 8px; border-bottom:1px solid #e5e7eb; }
  .kpi-label { color:#666; font-size:9px; }
  .kpi-value { font-weight:700; font-size:11px; color:#041F38; }
  .line { font-size:9px; color:#333; margin-bottom:4px; line-height:1.6; }
  .sub-line { font-size:8px; color:#666; margin:0 20px 6px 0; }
  .page-footer { text-align:center; font-size:7px; color:#999; margin-top:30px; }
</style></head><body>

<div class="header">
  <h1>ALGERNA</h1>
  <div class="sub">ولاية الجزائر — قاعة القيادة</div>
</div>
<div class="title">الإحاطة اليومية</div>
<div class="date">${esc(dateStr)}</div>

<div class="section">المؤشرات الرئيسية</div>
<table class="kpi">${kpiRows}</table>

<div class="section">الأولويات</div>
${prioRows || '<div class="line" style="color:#999;">لا توجد أولويات</div>'}

<div class="section">الإحاطة</div>
${briefRows || '<div class="line" style="color:#999;">لا توجد عناصر إحاطة</div>'}

<div class="section">القرارات المعلقة</div>
${decRows || '<div class="line" style="color:#999;">لا توجد قرارات معلقة</div>'}

<div class="page-footer">ALGERNA — منصة الحوكمة المدنية</div>
</body></html>`;

      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
      const pdfBuf = await page.pdf({ format: 'A4', margin: { top:'15mm', bottom:'15mm', left:'12mm', right:'12mm' }, printBackground: true });
      await browser.close();
      res.end(pdfBuf);

    } else {
      // ── RENDU FRANÇAIS VIA PDFKIT (inchangé) ──
      const fo = {};
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const fontR = path.join(FONT_DIR, 'DejaVuSans.ttf');
      const fontB = path.join(FONT_DIR, 'DejaVuSans-Bold.ttf');
      const fonts = { fontR: 'Helvetica', fontB: 'Helvetica-Bold' };
      if (fs.existsSync(fontR)) { doc.registerFont('main', fontR); fonts.fontR = 'main'; }
      if (fs.existsSync(fontB)) { doc.registerFont('mainB', fontB); fonts.fontB = 'mainB'; }

      doc.pipe(res);

      // Header
      doc.rect(0, 0, doc.page.width, 70).fill('#041F38');
      doc.font(fonts.fontB).fontSize(16).fillColor('#FFFFFF').text('ALGERNA', 40, 18, { width: doc.page.width - 80 });
      doc.font(fonts.fontR).fontSize(9).fillColor('#8ecae6');
      doc.text('Wilaya d\'Alger — Salle de commandement', 40, 38, { width: doc.page.width - 80 });
      doc.fillColor('#041F38').font(fonts.fontB).fontSize(14);
      doc.text('Briefing du jour', 40, 85, { width: doc.page.width - 80 });
      doc.font(fonts.fontR).fontSize(9).fillColor('#666666');
      const dateStr = new Date().toLocaleDateString('fr-DZ', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
      doc.text(dateStr, 40, 105, { width: doc.page.width - 80 });
      let y = 130;

      // Section helper
      function sec(label) {
        if (y > 700) { doc.addPage(); y = 40; }
        doc.rect(40, y, doc.page.width - 80, 22).fill('#063B5A');
        doc.font(fonts.fontB).fontSize(10).fillColor('#FFFFFF').text(label, 50, y + 5, { width: doc.page.width - 100 });
        doc.fillColor('#333333');
        y += 30;
      }
      function row(label, value) {
        if (y > 740) { doc.addPage(); y = 40; }
        doc.font(fonts.fontR).fontSize(9).fillColor('#666').text(label, 50, y, { continued: false });
        doc.font(fonts.fontB).fontSize(10).fillColor('#041F38').text(String(value), 200, y);
        y += 16;
      }
      function line(text) {
        if (y > 740) { doc.addPage(); y = 40; }
        doc.font(fonts.fontR).fontSize(9).fillColor('#333').text(text, 50, y, { width: doc.page.width - 100 });
        y += 14;
      }

      // 1. Synthèse KPI
      sec('Synthèse opérationnelle');
      row('Incidents critiques', critical);
      row('SLA dépassés', breached);
      row('Dossiers actifs', active);
      row('Score opérationnel', score + '/100');
      row('Décisions en attente', pendingDec);
      y += 8;

      // 2. Priorités
      sec('Priorités du jour');
      priorities.forEach(p => {
        const dir = p.direction || '—';
        const sla = Math.max(0, Math.round((p.sla_min || 0) / 60));
        line((p.reference || '') + ' — ' + (p.titre || '').substring(0, 60) + ' — ' + dir + (sla > 0 ? ' (+' + sla + 'h)' : ''));
      });
      y += 8;

      // 3. Briefing
      sec('Briefing');
      briefings.forEach(b => {
        line((b.heure || '') + ' — ' + b.titre);
        if (b.contenu) { doc.font(fonts.fontR).fontSize(8).fillColor('#666').text('   ' + b.contenu, 60, y, { width: doc.page.width - 120 }); y += 12; }
      });
      y += 8;

      // 4. Décisions
      sec('Décisions en attente');
      decisions.forEach(d => {
        const prio = d.priorite === 'haute' ? '● Haute' : '○ Moyenne';
        line(prio + ' — ' + d.titre + ' (' + (d.direction || '—') + ')');
      });

      doc.end();
    }
  } catch (e) {
    console.error('[command-center/briefing-pdf]', e.message);
    res.status(500).json({ erreur: e.message });
  }
});

// ── Référentiel géographique (pour formulaire crise) ──
router.get('/circonscriptions', authenticate, async (req, res) => {
  try {
    const { rows } = await query('SELECT id, nom FROM circonscription ORDER BY id');
    res.json({ ok: true, circonscriptions: rows });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// ══════════════════════════════════════════════
// ── MODE CRISE — sessions multi-événements ──
// ══════════════════════════════════════════════

// Gouvernance d'activation à 3 niveaux :
//   vigilance : tout profil CC autorisé
//   majeur    : admin_wilaya (cabinet + superviseur)
//   critique  : admin_wilaya superviseur uniquement
function canActivateCrise(user, niveau) {
  const isWilaya = user.role === 'admin_wilaya';
  const isSuperviseur = isWilaya && user.fonction === 'superviseur';
  const isCabinet = isWilaya && user.fonction === 'cabinet';
  const hasCC = Array.isArray(user.capacites) && user.capacites.includes('salle_commandement');
  if (niveau === 'critique') return isSuperviseur;
  if (niveau === 'majeur') return isSuperviseur || isCabinet;
  // vigilance : any CC-authorized user
  return isWilaya || isCabinet || hasCC;
}

function hasAnyCriseAccess(user) {
  const isWilaya = user.role === 'admin_wilaya';
  const isCabinet = user.fonction === 'cabinet';
  const hasCC = Array.isArray(user.capacites) && user.capacites.includes('salle_commandement');
  return isWilaya || isCabinet || hasCC;
}

// GET /crises — list active crisis sessions
router.get('/crises', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT cs.*, u.prenom || ' ' || u.nom AS active_par_nom,
        ARRAY(SELECT cc.circonscription_id FROM crise_circonscription cc WHERE cc.crise_id = cs.id) AS circonscription_ids,
        ARRAY(SELECT cm.commune_id FROM crise_commune cm WHERE cm.crise_id = cs.id) AS commune_ids
      FROM crise_session cs
      LEFT JOIN utilisateur u ON u.id = cs.active_par
      WHERE cs.statut IN ('active', 'cloture_provisoire')
      ORDER BY cs.active_le DESC
    `);
    res.json({ ok: true, crises: rows });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// GET /crises/active — lightweight: only active sessions (for banner)
router.get('/crises/active', authenticate, async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT cs.id, cs.titre, cs.titre_ar, cs.type_crise, cs.niveau, cs.active_le
      FROM crise_session cs WHERE cs.statut = 'active'
      ORDER BY cs.active_le DESC
    `);
    res.json({ ok: true, crises: rows });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// POST /crises — create a new crisis session
router.post('/crises', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const { titre, titre_ar, type_crise, niveau, notes, circonscription_ids, commune_ids } = req.body;
    if (!titre || !type_crise || !niveau) return res.status(400).json({ erreur: 'titre, type_crise et niveau requis' });
    if (!canActivateCrise(req.user, niveau)) return res.status(403).json({ erreur: 'Niveau d\'activation non autorisé pour ce profil' });

    const { rows: [session] } = await query(
      `INSERT INTO crise_session (titre, titre_ar, type_crise, niveau, active_par, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [titre, titre_ar || null, type_crise, niveau, req.user.id, notes || null]
    );

    // Attach geographic perimeter from reference tables
    if (Array.isArray(circonscription_ids) && circonscription_ids.length) {
      for (const cid of circonscription_ids) {
        await query('INSERT INTO crise_circonscription (crise_id, circonscription_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [session.id, cid]);
      }
    }
    if (Array.isArray(commune_ids) && commune_ids.length) {
      for (const cid of commune_ids) {
        await query('INSERT INTO crise_commune (crise_id, commune_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [session.id, cid]);
      }
    }

    res.json({ ok: true, crise: session });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// PATCH /crises/:id/cloturer — clôture provisoire
router.patch('/crises/:id/cloturer', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rows: [existing] } = await query('SELECT * FROM crise_session WHERE id = $1', [id]);
    if (!existing) return res.status(404).json({ erreur: 'Session non trouvée' });
    if (existing.statut !== 'active') return res.status(400).json({ erreur: 'Session non active' });
    if (!canActivateCrise(req.user, existing.niveau)) return res.status(403).json({ erreur: 'Non autorisé' });

    const { rows: [updated] } = await query(
      `UPDATE crise_session SET statut = 'cloture_provisoire', cloture_le = NOW(), cloture_par = $1, maj_le = NOW()
       WHERE id = $2 RETURNING *`,
      [req.user.id, id]
    );
    res.json({ ok: true, crise: updated });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// DELETE /crises/:id — suppression (tests uniquement)
router.delete('/crises/:id', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    await query('DELETE FROM crise_session WHERE id = $1', [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// GET /crises/hors-perimetre — signalements hors périmètre des crises actives
router.get('/crises/hors-perimetre', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const { rows: actives } = await query("SELECT id FROM crise_session WHERE statut = 'active'");
    if (!actives.length) return res.json({ ok: true, count: 0, signalements: [] });

    // Get all commune_ids covered by active crises
    const { rows: covered } = await query(`
      SELECT DISTINCT commune_id FROM crise_commune WHERE crise_id IN (SELECT id FROM crise_session WHERE statut = 'active')
      UNION
      SELECT DISTINCT c.id FROM commune c
      JOIN crise_circonscription cc ON cc.circonscription_id = c.circonscription_id
      WHERE cc.crise_id IN (SELECT id FROM crise_session WHERE statut = 'active')
    `);
    const coveredIds = covered.map(r => r.commune_id || r.id);

    if (!coveredIds.length) return res.json({ ok: true, count: 0, signalements: [] });

    const { rows } = await query(`
      SELECT s.id, s.reference, s.description, s.commune_id, c.nom AS commune_nom
      FROM signalement s LEFT JOIN commune c ON c.id = s.commune_id
      WHERE s.etat NOT IN ('resolu','clos','rejete')
        AND s.commune_id IS NOT NULL
        AND s.commune_id != ALL($1::int[])
      ORDER BY s.cree_le DESC LIMIT 20
    `, [coveredIds]);

    res.json({ ok: true, count: rows.length, signalements: rows });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// GET /crises/can-activate — check if current user can activate crises
router.get('/crises/can-activate', authenticate, async (req, res) => {
  res.json({ ok: true, canActivate: hasAnyCriseAccess(req.user) });
});

// ══════════════════════════════════════════════
// ── CRISE-2 — Mobilisation, notifications, rattachement, vue de crise ──
// ══════════════════════════════════════════════

// GET /organisations — liste des organismes mobilisables (lue en base, jamais en dur)
router.get('/organisations', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT id, nom, nom_ar, type, sigle_officiel, prioritaire
      FROM organisations
      WHERE actif = TRUE AND type IN ('direction','direction_wilaya','epic','operateur_externe','partenaire_institutionnel','apc','daira','service')
      ORDER BY type, ordre_affichage, nom
    `);
    res.json({ ok: true, organisations: rows });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// ── Auto-ajout des échelons territoriaux d'après le périmètre ──
async function autoAddTerritorialOrgs(criseId, userId) {
  // Trouver les communes du périmètre (direct + via circonscriptions)
  const { rows: communeIds } = await query(`
    SELECT DISTINCT commune_id AS id FROM crise_commune WHERE crise_id = $1
    UNION
    SELECT DISTINCT c.id FROM commune c
    JOIN crise_circonscription cc ON cc.circonscription_id = c.circonscription_id
    WHERE cc.crise_id = $1
  `, [criseId]);

  if (!communeIds.length) return [];

  const cids = communeIds.map(r => r.id);

  // Trouver les APC correspondant aux communes du périmètre
  const { rows: apcOrgs } = await query(`
    SELECT DISTINCT o.id FROM organisations o
    JOIN commune c ON o.nom = 'APC de ' || c.nom AND o.type = 'apc'
    WHERE c.id = ANY($1::int[])
  `, [cids]);

  // Trouver les daïras correspondantes
  const { rows: dairaOrgs } = await query(`
    SELECT DISTINCT d.organisation_id AS id FROM daira d
    JOIN commune c ON c.daira_id = d.id
    WHERE c.id = ANY($1::int[])
    AND d.organisation_id IS NOT NULL
  `, [cids]);

  const allOrgIds = [...new Set([...apcOrgs.map(r => r.id), ...dairaOrgs.map(r => r.id)])];
  const added = [];

  for (const orgId of allOrgIds) {
    try {
      await query(
        `INSERT INTO crise_organisme (crise_id, organisation_id, auto_territorial, ajoute_par)
         VALUES ($1, $2, TRUE, $3) ON CONFLICT (crise_id, organisation_id) DO NOTHING`,
        [criseId, orgId, userId]
      );
      added.push(orgId);
    } catch (e) { /* ignore duplicates */ }
  }
  return added;
}

// ── Notification ciblée aux organismes mobilisés ──
async function notifierMobilises(criseId, titre, niveau) {
  // Trouver les utilisateurs des organismes mobilisés
  const { rows: users } = await query(`
    SELECT DISTINCT u.id FROM utilisateur u
    JOIN crise_organisme co ON co.organisation_id = u.organisation_id
    WHERE co.crise_id = $1 AND u.actif = TRUE AND u.organisation_id IS NOT NULL
  `, [criseId]);

  const niveauLabel = niveau === 'critique' ? 'CRITIQUE' : niveau === 'majeur' ? 'MAJEUR' : 'VIGILANCE';
  const message = 'Session de crise activée : ' + titre + ' — Niveau ' + niveauLabel;

  for (const u of users) {
    try {
      await query(
        `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
         VALUES ($1, 'crise', $2, $3, $4)`,
        [u.id, 'Mobilisation crise — ' + niveauLabel, message, '/command-center']
      );
    } catch (e) { /* anti-spam: ignore if duplicate or error */ }
  }
  return users.length;
}

// ── Modifier POST /crises pour ajouter organismes + auto-territorial + notifications ──
// (On surcharge la route existante en ajoutant un handler après création)

// POST /crises/:id/organismes — ajouter des organismes mobilisés
router.post('/crises/:id/organismes', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const criseId = Number(req.params.id);
    const { organisation_ids } = req.body;
    if (!Array.isArray(organisation_ids) || !organisation_ids.length) {
      return res.status(400).json({ erreur: 'organisation_ids requis (tableau)' });
    }
    const { rows: [session] } = await query('SELECT * FROM crise_session WHERE id = $1', [criseId]);
    if (!session) return res.status(404).json({ erreur: 'Session non trouvée' });

    const added = [];
    for (const orgId of organisation_ids) {
      try {
        const { rows: [row] } = await query(
          `INSERT INTO crise_organisme (crise_id, organisation_id, auto_territorial, ajoute_par)
           VALUES ($1, $2, FALSE, $3) ON CONFLICT (crise_id, organisation_id) DO NOTHING RETURNING *`,
          [criseId, orgId, req.user.id]
        );
        if (row) added.push(row);
      } catch (e) { /* skip invalid org */ }
    }

    // Notifier les nouveaux mobilisés
    if (added.length) {
      const niveauLabel = session.niveau === 'critique' ? 'CRITIQUE' : session.niveau === 'majeur' ? 'MAJEUR' : 'VIGILANCE';
      for (const org of added) {
        const { rows: users } = await query(
          `SELECT id FROM utilisateur WHERE organisation_id = $1 AND actif = TRUE`,
          [org.organisation_id]
        );
        for (const u of users) {
          try {
            await query(
              `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
               VALUES ($1, 'crise', $2, $3, '/command-center')`,
              [u.id, 'Mobilisation crise — ' + niveauLabel, 'Votre organisme est mobilisé : ' + session.titre]
            );
          } catch (e) { /* ignore */ }
        }
      }
    }

    res.json({ ok: true, added: added.length });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// DELETE /crises/:id/organismes/:orgId — retirer un organisme
router.delete('/crises/:id/organismes/:orgId', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    await query(
      'DELETE FROM crise_organisme WHERE crise_id = $1 AND organisation_id = $2',
      [Number(req.params.id), Number(req.params.orgId)]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// GET /crises/:id/organismes — lister les organismes mobilisés d'une session
router.get('/crises/:id/organismes', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT co.*, o.nom, o.nom_ar, o.type, o.sigle_officiel
      FROM crise_organisme co
      JOIN organisations o ON o.id = co.organisation_id
      WHERE co.crise_id = $1
      ORDER BY co.auto_territorial DESC, o.type, o.nom
    `, [Number(req.params.id)]);
    res.json({ ok: true, organismes: rows });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// ── Enrichir POST /crises pour inclure organismes + auto-territorial + notifications ──
// On patch la route existante via un middleware post-création
// NOTE: La route POST /crises existante reste inchangée. On ajoute une route
// POST /crises/full qui fait création + organismes + auto + notifs en un seul appel.
router.post('/crises/full', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const { titre, titre_ar, type_crise, niveau, notes, circonscription_ids, commune_ids, organisation_ids } = req.body;
    if (!titre || !type_crise || !niveau) return res.status(400).json({ erreur: 'titre, type_crise et niveau requis' });
    if (!canActivateCrise(req.user, niveau)) return res.status(403).json({ erreur: 'Niveau d\'activation non autorisé pour ce profil' });

    // 1. Créer la session
    const { rows: [session] } = await query(
      `INSERT INTO crise_session (titre, titre_ar, type_crise, niveau, active_par, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [titre, titre_ar || null, type_crise, niveau, req.user.id, notes || null]
    );

    // 2. Périmètre géographique
    if (Array.isArray(circonscription_ids) && circonscription_ids.length) {
      for (const cid of circonscription_ids) {
        await query('INSERT INTO crise_circonscription (crise_id, circonscription_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [session.id, cid]);
      }
    }
    if (Array.isArray(commune_ids) && commune_ids.length) {
      for (const cid of commune_ids) {
        await query('INSERT INTO crise_commune (crise_id, commune_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [session.id, cid]);
      }
    }

    // 3. Organismes mobilisés (sélection manuelle)
    let manualCount = 0;
    if (Array.isArray(organisation_ids) && organisation_ids.length) {
      for (const orgId of organisation_ids) {
        try {
          await query(
            `INSERT INTO crise_organisme (crise_id, organisation_id, auto_territorial, ajoute_par)
             VALUES ($1, $2, FALSE, $3) ON CONFLICT DO NOTHING`,
            [session.id, orgId, req.user.id]
          );
          manualCount++;
        } catch (e) { /* skip invalid */ }
      }
    }

    // 4. Auto-ajout échelons territoriaux
    const autoAdded = await autoAddTerritorialOrgs(session.id, req.user.id);

    // 5. Notifications ciblées
    const notifCount = await notifierMobilises(session.id, titre, niveau);

    res.json({ ok: true, crise: session, organismes_manuels: manualCount, organismes_auto: autoAdded.length, notifications: notifCount });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// ── Rattachement de signalements à une session ──

// POST /crises/:id/signalements/:sigId — rattachement manuel
router.post('/crises/:id/signalements/:sigId', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const criseId = Number(req.params.id);
    const sigId = req.params.sigId;
    const { rows: [row] } = await query(
      `INSERT INTO crise_signalement (crise_id, signalement_id, rattache_par, auto_suggere)
       VALUES ($1, $2, $3, FALSE)
       ON CONFLICT (crise_id, signalement_id) DO NOTHING
       RETURNING *`,
      [criseId, sigId, req.user.id]
    );
    if (!row) return res.json({ ok: true, deja_rattache: true });
    res.json({ ok: true, rattachement: row });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// DELETE /crises/:id/signalements/:sigId — détacher
router.delete('/crises/:id/signalements/:sigId', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    await query('DELETE FROM crise_signalement WHERE crise_id = $1 AND signalement_id = $2',
      [Number(req.params.id), req.params.sigId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// PATCH /crises/:id/signalements/:sigId/etat — changer l'état de crise d'un signalement
router.patch('/crises/:id/signalements/:sigId/etat', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const { etat_crise } = req.body;
    const validStates = ['non_verifie', 'confirme', 'en_intervention', 'maitrise'];
    if (!validStates.includes(etat_crise)) return res.status(400).json({ erreur: 'État invalide : ' + validStates.join(', ') });

    const { rows: [updated] } = await query(
      `UPDATE crise_signalement SET etat_crise = $1, maj_etat_par = $2, maj_etat_le = NOW()
       WHERE crise_id = $3 AND signalement_id = $4 RETURNING *`,
      [etat_crise, req.user.id, Number(req.params.id), req.params.sigId]
    );
    if (!updated) return res.status(404).json({ erreur: 'Signalement non rattaché à cette session' });
    res.json({ ok: true, rattachement: updated });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// GET /crises/:id/signalements — signalements rattachés
router.get('/crises/:id/signalements', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT cs.*, s.reference, s.description, s.etat, s.gravite, s.lat, s.lng,
             s.cree_le AS sig_cree_le, c.nom AS commune_nom,
             cat.libelle AS categorie_label
      FROM crise_signalement cs
      JOIN signalement s ON s.id = cs.signalement_id
      LEFT JOIN commune c ON c.id = s.commune_id
      LEFT JOIN categorie_signal cat ON cat.id = s.categorie_id
      WHERE cs.crise_id = $1
      ORDER BY cs.rattache_le DESC
    `, [Number(req.params.id)]);
    res.json({ ok: true, signalements: rows });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// GET /crises/:id/suggestions — signalements dans le périmètre non encore rattachés
router.get('/crises/:id/suggestions', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const criseId = Number(req.params.id);
    // Communes du périmètre
    const { rows: communeRows } = await query(`
      SELECT DISTINCT commune_id AS id FROM crise_commune WHERE crise_id = $1
      UNION
      SELECT DISTINCT c.id FROM commune c
      JOIN crise_circonscription cc ON cc.circonscription_id = c.circonscription_id
      WHERE cc.crise_id = $1
    `, [criseId]);

    if (!communeRows.length) return res.json({ ok: true, suggestions: [] });
    const communeIds = communeRows.map(r => r.id);

    const { rows } = await query(`
      SELECT s.id, s.reference, s.description, s.etat, s.gravite, s.commune_id,
             c.nom AS commune_nom, s.cree_le, cat.libelle AS categorie_label
      FROM signalement s
      LEFT JOIN commune c ON c.id = s.commune_id
      LEFT JOIN categorie_signal cat ON cat.id = s.categorie_id
      WHERE s.commune_id = ANY($1::int[])
        AND s.etat NOT IN ('resolu','clos','rejete')
        AND s.id NOT IN (SELECT signalement_id FROM crise_signalement WHERE crise_id = $2)
      ORDER BY s.cree_le DESC
      LIMIT 30
    `, [communeIds, criseId]);

    res.json({ ok: true, suggestions: rows });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// GET /crises/:id/vue — vue de crise : KPI + signalements + organismes (tout filtré par périmètre)
router.get('/crises/:id/vue', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const criseId = Number(req.params.id);

    // Session
    const { rows: [session] } = await query(`
      SELECT cs.*, u.prenom || ' ' || u.nom AS active_par_nom
      FROM crise_session cs LEFT JOIN utilisateur u ON u.id = cs.active_par
      WHERE cs.id = $1
    `, [criseId]);
    if (!session) return res.status(404).json({ erreur: 'Session non trouvée' });

    // Périmètre (communes)
    const { rows: communeRows } = await query(`
      SELECT DISTINCT commune_id AS id FROM crise_commune WHERE crise_id = $1
      UNION
      SELECT DISTINCT c.id FROM commune c
      JOIN crise_circonscription cc ON cc.circonscription_id = c.circonscription_id
      WHERE cc.crise_id = $1
    `, [criseId]);
    const communeIds = communeRows.map(r => r.id);

    // KPI filtrés par périmètre
    let kpi = { total: 0, critiques: 0, en_intervention: 0, resolus: 0 };
    if (communeIds.length) {
      const { rows: [k] } = await query(`
        SELECT
          COUNT(*) FILTER (WHERE etat NOT IN ('resolu','clos','rejete'))::int AS total,
          COUNT(*) FILTER (WHERE gravite = 'danger_immediat' AND etat NOT IN ('resolu','clos','rejete'))::int AS critiques,
          COUNT(*) FILTER (WHERE etat = 'en_intervention')::int AS en_intervention,
          COUNT(*) FILTER (WHERE etat IN ('resolu','clos'))::int AS resolus
        FROM signalement WHERE commune_id = ANY($1::int[])
      `, [communeIds]);
      kpi = k;
    }

    // Signalements rattachés avec états de crise
    const { rows: signalements } = await query(`
      SELECT cs.etat_crise, cs.auto_suggere, cs.rattache_le,
             s.id AS signalement_id, s.reference, s.description, s.etat, s.gravite, s.lat, s.lng,
             s.cree_le AS sig_cree_le, c.nom AS commune_nom,
             cat.libelle AS categorie_label
      FROM crise_signalement cs
      JOIN signalement s ON s.id = cs.signalement_id
      LEFT JOIN commune c ON c.id = s.commune_id
      LEFT JOIN categorie_signal cat ON cat.id = s.categorie_id
      WHERE cs.crise_id = $1
      ORDER BY cs.rattache_le DESC
    `, [criseId]);

    // Organismes mobilisés
    const { rows: organismes } = await query(`
      SELECT co.organisation_id, co.auto_territorial, co.ajoute_le,
             o.nom, o.nom_ar, o.type, o.sigle_officiel
      FROM crise_organisme co
      JOIN organisations o ON o.id = co.organisation_id
      WHERE co.crise_id = $1
      ORDER BY co.auto_territorial DESC, o.type, o.nom
    `, [criseId]);

    // Communes du périmètre (pour la carte)
    const { rows: communes } = communeIds.length ? await query(`
      SELECT id, nom, nom_ar, centre_lat, centre_lng FROM commune WHERE id = ANY($1::int[])
    `, [communeIds]) : { rows: [] };

    res.json({
      ok: true,
      session,
      kpi,
      signalements,
      organismes,
      communes,
      perimetre_commune_ids: communeIds
    });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

// GET /crises/active — OVERRIDE: include mobilisation check for banner visibility
// Un profil non-CC ne voit le bandeau QUE s'il est mobilisé (son organisation est dans crise_organisme)
router.get('/crises/active/visible', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const isCC = hasAnyCriseAccess(user);

    let rows;
    if (isCC) {
      // CC profiles see all active crises
      const result = await query(`
        SELECT cs.id, cs.titre, cs.titre_ar, cs.type_crise, cs.niveau, cs.active_le
        FROM crise_session cs WHERE cs.statut = 'active'
        ORDER BY cs.active_le DESC
      `);
      rows = result.rows;
    } else if (user.organisation_id) {
      // Non-CC: only see crises where their org is mobilised
      const result = await query(`
        SELECT cs.id, cs.titre, cs.titre_ar, cs.type_crise, cs.niveau, cs.active_le
        FROM crise_session cs
        JOIN crise_organisme co ON co.crise_id = cs.id AND co.organisation_id = $1
        WHERE cs.statut = 'active'
        ORDER BY cs.active_le DESC
      `, [user.organisation_id]);
      rows = result.rows;
    } else {
      rows = [];
    }

    res.json({ ok: true, crises: rows });
  } catch (e) { res.status(500).json({ erreur: e.message }); }
});

module.exports = router;
