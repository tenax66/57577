CREATE TABLE tankas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- テストデータ
INSERT INTO tankas (user_id, content) VALUES 
('dummy_user1', '春の日に 心うきたつ 花の色 風にそよげる 若葉のように'),
('dummy_user2', '夏の夜の まどろみの中 虫の音 遠き記憶を 呼び覚ますか'); 
