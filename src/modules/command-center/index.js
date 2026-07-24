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
router.get('/briefing-pdf', authenticate, requireCommandCenter(), async (req, res) => {
  try {
    const isAr = req.query.lang === 'ar';
    const fo = isAr ? { features: ['rtla', 'rtlm'] } : {};

    // Fetch all data
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

    // Build PDF
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const fontR = path.join(FONT_DIR, 'DejaVuSans.ttf');
    const fontB = path.join(FONT_DIR, 'DejaVuSans-Bold.ttf');
    const fonts = { fontR: 'Helvetica', fontB: 'Helvetica-Bold' };
    if (fs.existsSync(fontR)) { doc.registerFont('main', fontR); fonts.fontR = 'main'; }
    if (fs.existsSync(fontB)) { doc.registerFont('mainB', fontB); fonts.fontB = 'mainB'; }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=briefing_' + new Date().toISOString().slice(0,10) + '.pdf');
    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 70).fill('#041F38');
    doc.font(fonts.fontB).fontSize(16).fillColor('#FFFFFF').text('ALGERNA', 40, 18, { width: doc.page.width - 80 });
    doc.font(fonts.fontR).fontSize(9).fillColor('#8ecae6');
    doc.text(isAr ? 'ولاية الجزائر — قاعة القيادة' : 'Wilaya d\'Alger — Salle de commandement', 40, 38, { width: doc.page.width - 80, ...fo });
    doc.fillColor('#041F38').font(fonts.fontB).fontSize(14);
    const title = isAr ? 'الإحاطة اليومية' : 'Briefing du jour';
    doc.text(title, 40, 85, { width: doc.page.width - 80, ...fo });
    doc.font(fonts.fontR).fontSize(9).fillColor('#666666');
    const dateStr = new Date().toLocaleDateString(isAr ? 'ar-DZ' : 'fr-DZ', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    doc.text(dateStr, 40, 105, { width: doc.page.width - 80, ...fo });
    let y = 130;

    // Section helper
    function sec(label) {
      if (y > 700) { doc.addPage(); y = 40; }
      doc.rect(40, y, doc.page.width - 80, 22).fill('#063B5A');
      doc.font(fonts.fontB).fontSize(10).fillColor('#FFFFFF').text(label, 50, y + 5, { width: doc.page.width - 100, ...fo });
      doc.fillColor('#333333');
      y += 30;
    }
    function row(label, value) {
      if (y > 740) { doc.addPage(); y = 40; }
      doc.font(fonts.fontR).fontSize(9).fillColor('#666').text(label, 50, y, { continued: false, ...fo });
      doc.font(fonts.fontB).fontSize(10).fillColor('#041F38').text(String(value), 200, y, { ...fo });
      y += 16;
    }
    function line(text) {
      if (y > 740) { doc.addPage(); y = 40; }
      doc.font(fonts.fontR).fontSize(9).fillColor('#333').text(text, 50, y, { width: doc.page.width - 100, ...fo });
      y += 14;
    }

    // 1. Synthèse KPI
    sec(isAr ? 'المؤشرات الرئيسية' : 'Synthèse opérationnelle');
    row(isAr ? 'حوادث حرجة' : 'Incidents critiques', critical);
    row(isAr ? 'تجاوزات المهل' : 'SLA dépassés', breached);
    row(isAr ? 'ملفات نشطة' : 'Dossiers actifs', active);
    row(isAr ? 'النتيجة التشغيلية' : 'Score opérationnel', score + '/100');
    row(isAr ? 'قرارات معلقة' : 'Décisions en attente', pendingDec);
    y += 8;

    // 2. Priorités
    sec(isAr ? 'الأولويات' : 'Priorités du jour');
    priorities.forEach(p => {
      const dir = isAr && p.direction_ar ? p.direction_ar : (p.direction || '—');
      const sla = Math.max(0, Math.round((p.sla_min || 0) / 60));
      line((p.reference || '') + ' — ' + (p.titre || '').substring(0, 60) + ' — ' + dir + (sla > 0 ? ' (+' + sla + 'h)' : ''));
    });
    y += 8;

    // 3. Briefing
    sec(isAr ? 'الإحاطة' : 'Briefing');
    briefings.forEach(b => {
      const t = isAr && b.titre_ar ? b.titre_ar : b.titre;
      const c = isAr && b.contenu_ar ? b.contenu_ar : b.contenu;
      line((b.heure || '') + ' — ' + t);
      if (c) { doc.font(fonts.fontR).fontSize(8).fillColor('#666').text('   ' + c, 60, y, { width: doc.page.width - 120, ...fo }); y += 12; }
    });
    y += 8;

    // 4. Décisions
    sec(isAr ? 'القرارات المعلقة' : 'Décisions en attente');
    decisions.forEach(d => {
      const t = isAr && d.titre_ar ? d.titre_ar : d.titre;
      const dir = isAr && d.direction_ar ? d.direction_ar : (d.direction || '—');
      const prio = d.priorite === 'haute' ? (isAr ? '● عالية' : '● Haute') : (isAr ? '○ متوسطة' : '○ Moyenne');
      line(prio + ' — ' + t + ' (' + dir + ')');
    });

    doc.end();
  } catch (e) {
    console.error('[command-center/briefing-pdf]', e.message);
    res.status(500).json({ erreur: e.message });
  }
});

module.exports = router;
