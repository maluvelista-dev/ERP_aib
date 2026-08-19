export const paginationParams = (value, defaultPageSize = 25) => {
  const page = Math.max(1, Number.parseInt(value?.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(10, Number.parseInt(value?.pageSize, 10) || defaultPageSize));
  return { page, pageSize, skip: (page - 1) * pageSize };
};

export const paginationMeta = (total, page, pageSize) => ({
  page,
  pageSize,
  total,
  totalPages: Math.max(1, Math.ceil(total / pageSize))
});
