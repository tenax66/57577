export type PaginationInfo = {
  current_page: number;
  has_next: boolean;
};

export type TankasResponse = {
  tankas: Tanka[];
  pagination: PaginationInfo;
}; 
