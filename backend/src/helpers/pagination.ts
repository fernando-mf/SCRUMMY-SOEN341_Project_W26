import { z } from "zod";

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

export const PaginationQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

type validPaginationQuery = z.infer<typeof PaginationQuerySchema>;

export function GetPaginationParams(totalCount: number, query: validPaginationQuery) {
  return {
    offset: (query.page - 1) * query.limit,
    totalPages: Math.ceil(totalCount / query.limit),
  };
}
