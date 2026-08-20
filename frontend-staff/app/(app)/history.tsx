/**
 * History Screen
 * ============================================================
 * Danh sách voucher đã xác nhận sử dụng
 *
 * Features:
 * - Segmented filter (All / Today / 7 Days / 30 Days)
 * - Date Range picker
 * - Pull to refresh
 * - Infinite scroll
 * - Search với debounce + clear button
 * - Empty states (no history / no search results)
 * - Error states (network / server)
 * - Skeleton loading
 */

import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useHistoryInfinite } from "../../src/hooks/useHistory";
import { isNetworkError } from "../../src/utils/network";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows, touchTarget } from "../../src/theme";
import {
  HistoryItemComponent,
  SearchBar,
  HistorySkeleton,
  HistoryEmpty,
  SegmentedFilter,
  DateRangePicker,
  SearchNoResults,
} from "../../src/components/history";
import { ResultBanner } from "../../src/components/voucher";
import type { RedemptionHistoryItem } from "../../src/types";

type DateFilter = "all" | "today" | "7days" | "30days";

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "today", label: "Hôm nay" },
  { value: "7days", label: "7 ngày" },
  { value: "30days", label: "30 ngày" },
];

export default function HistoryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customRange, setCustomRange] = useState<{
    from: string | null;
    to: string | null;
  }>({ from: null, to: null });

  // Compute date range from filter
  const dateRange = useMemo(() => {
    // Custom range takes precedence
    if (customRange.from || customRange.to) {
      return customRange;
    }

    const now = new Date();
    const to = now.toISOString();

    switch (dateFilter) {
      case "today": {
        const from = new Date(now);
        from.setHours(0, 0, 0, 0);
        return { from: from.toISOString(), to };
      }
      case "7days": {
        const from = new Date(now);
        from.setDate(from.getDate() - 7);
        return { from: from.toISOString(), to };
      }
      case "30days": {
        const from = new Date(now);
        from.setDate(from.getDate() - 30);
        return { from: from.toISOString(), to };
      }
      case "all":
      default:
        return { from: null, to: null };
    }
  }, [dateFilter, customRange]);

  const trimmedSearch = search.trim();

  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    fetchNextPage,
    error,
  } = useHistoryInfinite({
    limit: 20,
    search: trimmedSearch || undefined,
    dateFrom: dateRange.from ?? undefined,
    dateTo: dateRange.to ?? undefined,
  });

  // Flatten items from all pages
  const items: RedemptionHistoryItem[] =
    data?.pages.flatMap((page) => page.data) ?? [];

  const totalCount = data?.pages[0]?.pagination.total ?? 0;

  // Check if has filters (to determine empty state)
  const hasFilters = !!trimmedSearch || dateFilter !== "all" || !!customRange.from || !!customRange.to;

  // Handle item press
  const handleItemPress = useCallback(
    (item: RedemptionHistoryItem) => {
      router.push({
        pathname: "/(app)/voucher/[id]",
        params: {
          id: item.issuedVoucherId.toString(),
          voucherCode: item.voucherCode,
          isManual: "false",
        },
      });
    },
    [router],
  );

  // Handle scan new
  const handleScanNew = useCallback(() => {
    router.replace("/(app)/scan");
  }, [router]);

  // Handle filter change - reset custom range
  const handleFilterChange = useCallback((value: DateFilter) => {
    setDateFilter(value);
    setCustomRange({ from: null, to: null });
  }, []);

  // Handle date range change - switch to "all" view
  const handleDateRangeChange = useCallback(
    (from: string | null, to: string | null) => {
      setCustomRange({ from, to });
    },
    [],
  );

  // Handle clear all filters
  const handleClearFilters = useCallback(() => {
    setSearch("");
    setDateFilter("all");
    setCustomRange({ from: null, to: null });
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // FlatList getItemLayout
  const getItemLayout = useCallback(
    (_data: ArrayLike<RedemptionHistoryItem> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  // Render item
  const renderItem = useCallback(
    ({ item }: { item: RedemptionHistoryItem }) => (
      <HistoryItemComponent item={item} onPress={() => handleItemPress(item)} />
    ),
    [handleItemPress],
  );

  // Render footer
  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Đang tải...</Text>
        </View>
      );
    }
    if (!hasNextPage && items.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã hiển thị tất cả</Text>
        </View>
      );
    }
    return null;
  }, [hasNextPage, isFetchingNextPage, items.length]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (hasFilters) {
      return <SearchNoResults searchQuery={trimmedSearch} onClearFilter={handleClearFilters} />;
    }
    return <HistoryEmpty onScanPress={handleScanNew} />;
  }, [hasFilters, trimmedSearch, handleClearFilters, handleScanNew]);

  // Loading state (initial)
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <HistorySkeleton />
      </View>
    );
  }

  // Error state (only show when no data at all)
  if (error && items.length === 0) {
    const isOffline = isNetworkError(error);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ResultBanner
          type="error"
          title={isOffline ? "Không có kết nối" : "Lỗi"}
          message={
            isOffline
              ? "Vui lòng kiểm tra kết nối và thử lại"
              : "Không thể tải lịch sử"
          }
          onPrimaryAction={handleRetry}
          primaryActionLabel="Thử lại"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Search + Date Range */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchBarWrapper}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm theo mã hoặc tên"
              isLoading={isRefetching && trimmedSearch.length > 0}
            />
          </View>
          <DateRangePicker
            dateFrom={dateRange.from}
            dateTo={dateRange.to}
            onChange={handleDateRangeChange}
          />
        </View>

        {/* Segmented Filter */}
        <SegmentedFilter
          options={DATE_FILTERS}
          value={dateFilter}
          onChange={handleFilterChange}
          accessibilityLabel="Lọc theo thời gian"
        />
      </View>

      {/* Stats */}
      {items.length > 0 && (
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            Hiển thị <Text style={styles.statsCount}>{items.length}</Text>
            {totalCount > items.length && (
              <Text> / {totalCount}</Text>
            )}{" "}
            voucher
          </Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.issuedVoucherId.toString()}
        contentContainerStyle={
          items.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        removeClippedSubviews={true}
        windowSize={10}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        getItemLayout={getItemLayout}
      />
    </View>
  );
}

const ITEM_HEIGHT = 140;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  headerPlaceholder: {
    width: touchTarget.min,
  },
  controlsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  searchRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  searchBarWrapper: {
    flex: 1,
  },
  statsRow: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  statsText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statsCount: {
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  separator: {
    height: spacing.sm,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
});
