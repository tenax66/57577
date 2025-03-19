import { Hono } from 'hono';
import type { Bindings, TankaWithLikes } from '../../types';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async c => {
  const query = c.req.query('q');
  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  try {
    // FTS5を使用した検索クエリ
    const { results } = await c.env.DB.prepare(
      `
      SELECT 
        t.*,
        u.display_name,
        u.clerk_id,
        COUNT(l.id) as likes_count,
        FALSE as is_liked
      FROM fts
      JOIN tankas t ON fts.rowid = t.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN likes l ON t.id = l.tanka_id
      WHERE fts.segments MATCH ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `
    )
      .bind(query)
      .all<TankaWithLikes>();

    return c.json({
      tankas: results,
      total: results.length,
      page: 1,
      per_page: results.length,
    });
  } catch (e) {
    console.error('Search error:', e);
    return c.json({ error: 'Invalid search parameters' }, 400);
  }
});

export default app;
