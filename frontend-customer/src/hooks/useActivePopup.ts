import { useEffect, useState, useCallback } from 'react';
import { popupApi, type Popup } from '../services/api';

const STORAGE_KEY = 'everest_popup_dismissed_id';

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

      // Only show if not previously dismissed for this popup id.
      if (active) {
        const dismissedId = localStorage.getItem(STORAGE_KEY);
        if (dismissedId && Number(dismissedId) === active.popupId) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải popup');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();
  }, [fetchActive]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    if (popup) {
      localStorage.setItem(STORAGE_KEY, String(popup.popupId));
    }
  }, [popup]);

  const refetch = useCallback(() => {
    fetchActive();
  }, [fetchActive]);

  return { popup, isLoading, isVisible, error, dismiss, refetch };
}