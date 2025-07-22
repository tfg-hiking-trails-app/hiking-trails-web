export interface Pagination<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
