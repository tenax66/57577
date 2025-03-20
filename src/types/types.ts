export type PaginationInfo = {
  current_page: number;
  has_next: boolean;
};

export type TankasResponse = {
  tankas: TankaWithLikes[];
  pagination: PaginationInfo;
};

export type TankaWithLikes = {
  id: number;
  content: string;
  user_id: number;
  created_at: string;
  display_name: string;
  clerk_id: string;
  is_liked: boolean;
  likes_count: number;
};
