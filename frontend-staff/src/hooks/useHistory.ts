/**
 * useHistory Hooks
 * ============================================================
 * React Query hooks cho history
 */

import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
  type InfiniteData,
} from "@tanstack/react-query";
import { getRedemptionHistory } from "../services/history.service";
import type {
  HistoryQuery,
  RedemptionHistoryItem,
  HistoryPagination,
} from "../types";

// Query keys
export const historyKeys = {
  all: ["history"] as const,
  list: (query: HistoryQuery) => ["history", "list", query] as const,
  infinite: (query: Omit<HistoryQuery, "page">) =>
    ["history", "infinite", query] as const,
};

interface HistoryPage {
  data: RedemptionHistoryItem[];
  pagination: HistoryPagination;
}

/**
 * Infinite scroll history hook
 */
export function useHistoryInfinite(
  baseQuery: Omit<HistoryQuery, "page">,
): UseInfiniteQueryResult<InfiniteData<HistoryPage>, Error> {
  return useInfiniteQuery<HistoryPage, Error>({
    queryKey: historyKeys.infinite(baseQuery),
    queryFn: ({ pageParam }) =>
      getRedemptionHistory({
        ...baseQuery,
        page: pageParam as number,
      }).then((res) => ({
        data: res.data,
        pagination: res.pagination,
      })),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.page + 1
        : undefined;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}
