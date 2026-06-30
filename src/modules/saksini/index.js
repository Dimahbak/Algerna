const express = require('express');
const { query } = require('../../db/pool');
const { asyncH } = require('../../utils/http');
const router = express.Router();

function normalize(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[''`]/g, ' ')
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ') // keep arabic chars
    .replace(/\s+/g, ' ').trim();
}

// GET /api/saksini/search?q=hopital
router.get('/search', asyncH(async (req, res) => {
  const q = normalize(req.query.q || '');
  if (!q || q.length < 2) return res.json([]);

  const words = q.split(' ').filter(w => w.length >= 2);
  if (!words.length) return res.json([]);

  // Search in keyword, synonyms, title_fr, title_ar, description_fr, description_ar
  // Score: exact keyword match = +10, synonym match = +8, title match = +5, description match = +3
  const { rows } = await query(`
    SELECT *,
      CASE WHEN keyword = $1 THEN 10
           WHEN keyword LIKE '%' || $1 || '%' THEN 7
           ELSE 0 END AS score_kw,
      CASE WHEN $1 = ANY(synonyms) THEN 8
           WHEN EXISTS (SELECT 1 FROM unnest(synonyms) s WHERE s ILIKE '%' || $1 || '%') THEN 6
           ELSE 0 END AS score_syn,
      CASE WHEN title_fr ILIKE '%' || $1 || '%' OR title_ar ILIKE '%' || $1 || '%' THEN 5 ELSE 0 END AS score_title,
      CASE WHEN description_fr ILIKE '%' || $1 || '%' OR description_ar ILIKE '%' || $1 || '%' THEN 3 ELSE 0 END AS score_desc
    FROM saksini_index
    WHERE is_active = TRUE AND (
      keyword ILIKE '%' || $1 || '%'
      OR EXISTS (SELECT 1 FROM unnest(synonyms) s WHERE s ILIKE '%' || $1 || '%')
      OR title_fr ILIKE '%' || $1 || '%'
      OR title_ar ILIKE '%' || $1 || '%'
      OR description_fr ILIKE '%' || $1 || '%'
      OR description_ar ILIKE '%' || $1 || '%'
    )
    ORDER BY (CASE WHEN keyword = $1 THEN 10
                   WHEN keyword LIKE '%' || $1 || '%' THEN 7
                   ELSE 0 END +
              CASE WHEN $1 = ANY(synonyms) THEN 8
                   WHEN EXISTS (SELECT 1 FROM unnest(synonyms) s WHERE s ILIKE '%' || $1 || '%') THEN 6
                   ELSE 0 END +
              CASE WHEN title_fr ILIKE '%' || $1 || '%' OR title_ar ILIKE '%' || $1 || '%' THEN 5 ELSE 0 END +
              CASE WHEN description_fr ILIKE '%' || $1 || '%' OR description_ar ILIKE '%' || $1 || '%' THEN 3 ELSE 0 END +
              priority) DESC
    LIMIT 5
  `, [q]);

  res.json(rows.map(r => ({
    title_fr: r.title_fr,
    title_ar: r.title_ar,
    description_fr: r.description_fr,
    description_ar: r.description_ar,
    category: r.category,
    target_type: r.target_type,
    target_route: r.target_route,
    priority: r.priority
  })));
}));

module.exports = router;
