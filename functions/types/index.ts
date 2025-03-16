import type { D1Database } from '@cloudflare/workers-types';

export type Bindings = {
  DB: D1Database;
  CLERK_SECRET_KEY: string;
  CLERK_WEBHOOK_SECRET: string;
};

export type Tanka = {
  id: number;
  content: string;
  user_id: string;
  created_at: string;
};

export type User = {
  id: number;
  clerk_id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};
