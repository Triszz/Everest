/**
 * hooks/useLocalStorage.ts
 * ------------------------------------------------------------------
 * Hook đọc/ghi state xuống localStorage với auto sync.
 *
 * @example
 *   const [theme, setTheme] = useLocalStorage("theme", "light");
 */
import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [value, setValue] = useState<T>(readValue);

  // Sync với các tab khác (event 'storage').
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key) setValue(readValue());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key, readValue]);

  const setStoredValue = (next: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setValue(next);
    } catch (err) {
      console.warn(`[useLocalStorage] Failed to write "${key}":`, err);
    }
  };

  return [value, setStoredValue] as const;
}