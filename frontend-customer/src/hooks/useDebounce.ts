/**
 * hooks/useDebounce.ts
 * ------------------------------------------------------------------
 * Hook generic debounce giá trị.
 *
 * Trì hoãn cập nhật `debouncedValue` cho tới khi `value` không đổi
 * trong khoảng `delay` ms.
 *
 * @example
 *   const [search, setSearch] = useState("");
 *   const debouncedSearch = useDebounce(search, 400);
 *   // debouncedSearch chỉ thay đổi sau khi user ngừng gõ 400ms.
 */
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}