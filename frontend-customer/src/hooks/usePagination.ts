/**
 * hooks/usePagination.ts
 * ------------------------------------------------------------------
 * Hook đơn giản để quản lý state phân trang (page + pageSize).
 *
 * Cung cấp:
 *  - `page`, `pageSize`
 *  - `setPage(n)`         : chuyển trang (clamp 1..totalPages)
 *  - `setPageSize(n)`     : đổi kích thước trang
 *  - `pagination`         : object PaginationMeta sẵn sàng gửi API
 *  - `offset`             : (page-1)*pageSize, cho API lấy danh sách offset
 *
 * @example
 *   const { page, setPage, pagination, offset } = usePagination({ pageSize: 20 });
 */
import { useState, useCallback, useMemo } from "react";
import type { PaginationMeta } from "../services";

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination(opts: UsePaginationOptions = {}) {
  const [page, setPageState] = useState<number>(opts.initialPage ?? 1);
  const [pageSize, setPageSize] = useState<number>(opts.initialPageSize ?? 20);

  /** Đặt trang mới, tự clamp về >= 1. */
  const setPage = useCallback((next: number) => {
    setPageState(Math.max(1, next));
  }, []);

  /** Đặt pageSize mới và reset về trang 1. */
  const changePageSize = useCallback((next: number) => {
    setPageSize(next);
    setPageState(1);
  }, []);

  /** Offset cho các API dùng skip/take. */
  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  /** Object PaginationMeta sẵn sàng truyền cho API. */
  const pagination: PaginationMeta = useMemo(
    () => ({ page, pageSize, total: 0, totalPages: 1 }),
    [page, pageSize]
  );

  return { page, pageSize, setPage, setPageSize: changePageSize, offset, pagination };
}