import { Hono } from 'hono';
import type { Bindings, TankaWithLikes } from '../../types';
import { getAuth } from '@hono/clerk-auth';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async c => {
  const query = c.req.query('q');
  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  // ユーザーIDの取得（ログインしている場合）
  const auth = getAuth(c);
  const userId = auth?.userId;

  let dbUserId: number | null = null;
  if (userId) {
    const { results } = await c.env.DB.prepare('SELECT id FROM users WHERE clerk_id = ?')
      .bind(userId)
      .all<{ id: number }>();
    if (results.length > 0) {
      dbUserId = results[0].id;
    }
  }

  try {
    // FTS5を使用した検索クエリ
    const { results } = await c.env.DB.prepare(
      `
      SELECT 
        t.id, 
        t.content, 
        t.user_id,
        t.created_at, 
        u.display_name, 
        u.clerk_id,
        ${dbUserId ? 'EXISTS(SELECT 1 FROM likes WHERE user_id = ? AND tanka_id = t.id) as is_liked' : 'FALSE as is_liked'},
        COUNT(l.id) as likes_count
      FROM fts
      JOIN tankas t ON fts.rowid = t.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN likes l ON t.id = l.tanka_id
      WHERE fts.segments MATCH ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `
    )
      .bind(`${query}*`, 10, 0)
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
