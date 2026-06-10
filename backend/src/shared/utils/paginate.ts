export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
}

export const getPagination = (query: PaginationQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginated = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) => ({
  data,
  pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
});
