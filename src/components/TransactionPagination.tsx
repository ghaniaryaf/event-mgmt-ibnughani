// components/TransactionPagination.ts

export interface PaginationResult<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  data: T[];
}

export function paginate<T>(
  items: T[],
  currentPage: number,
  pageSize: number
): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = items.slice(startIndex, endIndex);

  return {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    data,
  };
}
