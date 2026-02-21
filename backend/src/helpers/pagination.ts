export type PaginatedResponse<T> = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  data: T[];
};

export type PaginationQuery = {
  /**
   * Page number
   * @default 1
   */
  page?: number;

  /**
   * Items per page
   * @default 10
   */
  limit?: number;
};
