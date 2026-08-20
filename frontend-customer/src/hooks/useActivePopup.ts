/**
 * hooks/useActivePopup.ts
 * ------------------------------------------------------------------
 * Hook lấy popup đang active (1 popup mới nhất) từ backend.
 *
 * Trả về:
 *  - `popup`    : Dữ liệu popup (null nếu không có).
 *  - `isLoading`: Đang fetch.
 *  - `error`    : Lỗi nếu có.
 *  - `isVisible`: Có đang hiển thị popup hay không.
 *  - `dismiss()`: Đóng popup (set isVisible = false).
 *  - `refetch()`: Reload popup từ server.
 * ------------------------------------------------------------------
 */
import { useEffect, useState, useCallback } from 'react';
import { popupApi, type Popup } from '../services';

export function useActivePopup() {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchActive = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await popupApi.getActive();
      const active = res.data;
      setPopup(active);
      setIsVisible(active ? true : false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải popup');
      setIsVisible(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();
  }, [fetchActive]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  const refetch = useCallback(() => {
    fetchActive();
  }, [fetchActive]);

  return { popup, isLoading, error, isVisible, dismiss, refetch };
}