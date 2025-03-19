import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/backend';
import tankaRoutes from './tankas';
import userRoutes from './users';
import type { Bindings } from '../types';
import searchRoutes from './search';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/health-check', c => {
  return c.json({
    message: 'Hello',
  });
});

// 短歌関連のルートをマウント
app.route('/api/tankas', tankaRoutes);
app.route('/api/users', userRoutes);
app.route('/api/search', searchRoutes);

// Webhookエンドポイント
app.post('/api/webhooks/clerk', async c => {
  try {
    // リクエストヘッダーの検証
    const svix_id = c.req.header('svix-id');
    const svix_timestamp = c.req.header('svix-timestamp');
    const svix_signature = c.req.header('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return c.json({ error: 'Missing svix headers' }, 400);
    }

    // リクエストボディの取得
    const payload = await c.req.json();
    const body = JSON.stringify(payload);

    // Webhookの検証
    const wh = new Webhook(c.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;

    // イベントタイプに応じた処理
    switch (evt.type) {
      case 'user.created': {
        const { id: clerk_id, image_url } = evt.data;

        // ユーザーをD1に保存
        const { success } = await c.env.DB.prepare(
          `
          INSERT INTO users (clerk_id, display_name, avatar_url)
          VALUES (?, ?, ?)
        `
        )
          .bind(clerk_id, 'ユーザー', image_url || null)
          .run();

        if (!success) {
          throw new Error('Failed to insert user');
        }

        return c.json({ message: 'User created successfully' }, 201);
      }

      case 'user.updated': {
        const { id: clerk_id, image_url } = evt.data;

        // ユーザー情報を更新
        const { success } = await c.env.DB.prepare(
          `
          UPDATE users 
          SET avatar_url = ?
          WHERE clerk_id = ?
        `
        )
          .bind(image_url || null, clerk_id)
          .run();

        if (!success) {
          throw new Error('Failed to update user');
        }

        return c.json({ message: 'User updated successfully' });
      }

      case 'user.deleted': {
        const { id: clerk_id } = evt.data;

        // ユーザーを削除
        const { success } = await c.env.DB.prepare('DELETE FROM users WHERE clerk_id = ?')
          .bind(clerk_id)
          .run();

        if (!success) {
          throw new Error('Failed to delete user');
        }

        return c.json({ message: 'User deleted successfully' });
      }

      default:
        return c.json({ message: 'Webhook received' });
    }
  } catch (e) {
    console.error('Webhook error:', e);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

export const onRequest = handle(app);
