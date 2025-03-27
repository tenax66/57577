import { Hono } from 'hono';
import type { Bindings, User, TankaWithLikes } from '../../types';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';

const app = new Hono<{ Bindings: Bindings }>();

// ユーザー情報取得API
app.get('/:clerk_id', async c => {
  try {
    const clerk_id = c.req.param('clerk_id');
    const { results } = await c.env.DB.prepare('SELECT * FROM users WHERE clerk_id = ?')
      .bind(clerk_id)
      .all<User>();

    if (results.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user: results[0] });
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ユーザーの短歌一覧取得API
app.get('/:clerk_id/tankas', async c => {
  try {
    const clerk_id = c.req.param('clerk_id');
    const page = parseInt(c.req.query('page') || '1');
    const per_page = 10; // 1ページあたりの短歌数

    // まずユーザーIDを取得
    const { results: users } = await c.env.DB.prepare('SELECT id FROM users WHERE clerk_id = ?')
      .bind(clerk_id)
      .all<{ id: number }>();

    if (users.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    // 短歌の総数を取得
    const { results: countResult } = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM tankas WHERE user_id = ?'
    )
      .bind(users[0].id)
      .all<{ count: number }>();

    const total = countResult[0].count;
    const offset = (page - 1) * per_page;

    // ユーザーの短歌を取得（ページネーション付き）
    const { results: tankas } = await c.env.DB.prepare(
      `
        SELECT
          tankas.id,
          tankas.content,
          tankas.user_id,
          tankas.created_at
        FROM tankas
        WHERE user_id = ? 
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `
    )
      .bind(users[0].id, per_page, offset)
      .all<TankaWithLikes>();

    return c.json({
      tankas,
      pagination: {
        current_page: page,
        has_next: offset + tankas.length < total,
      },
    });
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ユーザーがいいねした短歌一覧取得API
app.get('/:clerk_id/likes', async c => {
  try {
    const clerk_id = c.req.param('clerk_id');
    const page = parseInt(c.req.query('page') || '1');
    const per_page = 10; // 1ページあたりの短歌数

    // まずユーザーIDを取得
    const { results: users } = await c.env.DB.prepare('SELECT id FROM users WHERE clerk_id = ?')
      .bind(clerk_id)
      .all<{ id: number }>();

    if (users.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    // いいねした短歌の総数を取得
    const { results: countResult } = await c.env.DB.prepare(
      `SELECT COUNT(*) as count 
       FROM likes 
       JOIN tankas ON likes.tanka_id = tankas.id
       WHERE likes.user_id = ?`
    )
      .bind(users[0].id)
      .all<{ count: number }>();

    const total = countResult[0].count;
    const offset = (page - 1) * per_page;

    // ユーザーがいいねした短歌を取得（ページネーション付き）
    const { results: tankas } = await c.env.DB.prepare(
      `
        SELECT
          tankas.id,
          tankas.content,
          tankas.user_id,
          tankas.created_at,
          COUNT(likes.id) as likes_count,
          1 as is_liked
        FROM likes
        JOIN tankas ON likes.tanka_id = tankas.id
        LEFT JOIN likes AS all_likes ON tankas.id = all_likes.tanka_id
        WHERE likes.user_id = ?
        GROUP BY tankas.id
        ORDER BY likes.created_at DESC
        LIMIT ? OFFSET ?
      `
    )
      .bind(users[0].id, per_page, offset)
      .all<TankaWithLikes>();

    return c.json({
      tankas,
      pagination: {
        current_page: page,
        has_next: offset + tankas.length < total,
      },
    });
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ユーザー情報更新API
app.patch('/:clerk_id', clerkMiddleware(), async c => {
  const auth = getAuth(c);
  const clerk_id = c.req.param('clerk_id');

  // 自分のデータのみ更新可能
  if (!auth?.userId || auth.userId !== clerk_id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { display_name } = await c.req.json();

    // 文字数チェックを追加
    if (!display_name || display_name.length > 30) {
      return c.json({ error: 'ユーザー名は1文字以上30文字以下で入力してください' }, 400);
    }

    const { success } = await c.env.DB.prepare(
      `
        UPDATE users 
        SET display_name = ?
        WHERE clerk_id = ?
      `
    )
      .bind(display_name, clerk_id)
      .run();

    if (!success) {
      throw new Error('Failed to update user');
    }

    return c.json({ message: 'User updated successfully' });
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default app;
