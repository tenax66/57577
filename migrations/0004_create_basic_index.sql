CREATE INDEX idx_tankas_user_id ON tankas(user_id);
CREATE INDEX idx_tankas_created_at ON tankas(created_at DESC);
CREATE INDEX idx_users_clerk_id ON users(clerk_id); 
