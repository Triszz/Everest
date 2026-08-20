/**
 * Voucher Detail Screen
 * ============================================================
 * Hiển thị chi tiết voucher và xác nhận sử dụng
 *
 * Flow:
 * 1. Nhận issuedVoucherId + voucherCode qua navigation
 * 2. Lấy data từ React Query cache (nếu có)
 * 3. Nếu cache không có → call validate API
 * 4. Confirm flow
 * 5. Invalidate dashboard/history
 */

import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack, useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useConfirmVoucher } from "../../../src/hooks/useRedemption";
import { useVoucherDetail } from "../../../src/hooks/useVoucherDetail";
import { useAuth } from "../../../src/hooks/useAuth";
import { STATUS_CONFIG } from "../../../src/constants";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  shadows,
  touchTarget,
} from "../../../src/theme";
import {
  StatusBadge,
  VoucherCard,
  CustomerCard,
  BranchCard,
  ConfirmDialog,
  ResultBanner,
} from "../../../src/components/voucher";
import { PrimaryButton } from "../../../src/components/ui";
import type {
  RedemptionStatusCode,
  ConfirmSuccessData,
} from "../../../src/types";

export default function VoucherDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string; // issuedVoucherId (small primitive)
    voucherCode: string; // voucherCode (small primitive)
    status?: string;
    error?: string;
    canConfirm?: string;
    isManual?: string;
  }>();

  const queryClient = useQueryClient();
  const { data: user } = useAuth();
  const confirmMutation = useConfirmVoucher();

  // Use hook to get data from cache or API
  const {
    data: validateResponse,
    voucherData,
    isLoading: isLoadingDetail,
    refetch,
    error: detailError,
  } = useVoucherDetail({
    voucherCode: params.voucherCode,
    mode: "detail",
  });

  // Parse status from params (if navigating from error)
  const statusFromParams = params.status as RedemptionStatusCode | undefined;
  const errorFromParams = params.error;
  const isFromManual = params.isManual === "true";

  // State
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmResult, setConfirmResult] = useState<{
    success: boolean;
    data?: ConfirmSuccessData;
    error?: { code: string; message: string };
  } | null>(null);

  // ✅ RCA Bug Triệt Để: Reset transient state khi screen FOCUS (không phải mount).
  //
  // Lý do KHÔNG dùng useEffect([params.voucherCode]):
  // - React Navigation reuse component instance khi push cùng route name
  //   với params khác nhau — useEffect CÓ fire đúng, NHƯNG...
  // - `router.replace("/(app)/home")` hay `router.replace("/(app)/scan")`
  //   trên Tabs navigator KHÔNG phải replace thật — Expo Router map nó
  //   thành JUMP_TO do Bottom Tabs không có replace event (theo expo/expo#36385).
  //   Voucher/[id] component KHÔNG bị unmount → state vẫn còn.
  // - Khi user mở lại voucher từ History, component được REUSE với
  //   confirmResult.success=true → Success screen hiện lại dù user đã rời.
  //
  // Fix: useFocusEffect chạy MỖI LẦN screen được focus (mount hoặc come back
  // từ tab khác). Cleanup chạy khi screen unfocus. Đây là primitive
  // ĐÚNG cho "reset state on focus" theo Expo Router docs.
  //
  // Lưu ý: KHÔNG refetch data ở đây — để React Query tự quản lý cache.
  // Chỉ reset transient UI state (confirmResult, showConfirmDialog).
  useFocusEffect(
    useCallback(() => {
      setConfirmResult(null);
      setShowConfirmDialog(false);
    }, []),
  );

  // Invalidate dashboard/history queries AND vouher-detail cache sau khi
  // confirm thành công. Cache của voucher-detail (mode='detail') phải bị
  // xoá để lần mở tiếp theo sẽ fetch fresh data với usageStatus='Used'.
  //
  // Note: Trước đây code KHÔNG invalidate voucher-detail vì sợ "UI flip"
  // từ Success → "Không thể tải voucher". Nhưng đó là concern của mode='validate'
  // (POST /validate trả ALREADY_USED cho Used voucher). mode='detail' (GET /voucher/:code)
  // LUÔN trả success=true với đầy đủ data kể cả Used — KHÔNG bị flip.
  const invalidateRelatedQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["history"] });
    queryClient.invalidateQueries({ queryKey: ["redemption"] });
    // Invalidate voucher-detail cache cho code này ở cả 2 mode để đảm bảo
    // fresh data ở mọi entry point (History, Scan, Manual).
    queryClient.invalidateQueries({
      queryKey: ["voucher-detail", params.voucherCode],
    });
  }, [queryClient, params.voucherCode]);

  // Handle back
  // Dùng router.back() nếu có stack phía dưới (History, Scan, Manual...).
  // Nếu không (direct navigate), fallback về scan/manual như cũ.
  // Fix: trước đây handleBack LUÔN dùng router.replace("/scan") — khiến user
  // mở voucher từ History → Back lại quay về Scan thay vì History.
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    // Fallback: không có stack → về scan/manual
    if (isFromManual) {
      router.replace("/(app)/manual");
    } else {
      router.replace("/(app)/scan");
    }
  }, [router, isFromManual]);

  // Handle retry - re-call validate API
  const handleRetry = useCallback(async () => {
    setConfirmResult(null);
    try {
      await refetch();
    } catch {
      // Error will be available via detailError
    }
  }, [refetch]);

  // Handle confirm
  const handleConfirm = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  // Handle confirm submit
  const handleConfirmSubmit = useCallback(async () => {
    if (!voucherData) return;

    try {
      const response = await confirmMutation.mutateAsync({
        voucherCode: voucherData.voucherCode,
        selectedBranchId: user?.branchId,
      });

      if (response.success && response.status === "CONFIRMED") {
        setConfirmResult({
          success: true,
          data: response.data,
        });
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );

        // Invalidate related queries to sync dashboard/history
        invalidateRelatedQueries();
      } else {
        const statusCode = response.status as RedemptionStatusCode;
        setConfirmResult({
          success: false,
          error: {
            code: statusCode,
            message:
              response.error?.message ??
              STATUS_CONFIG[statusCode]?.label ??
              "Lỗi không xác định",
          },
        });
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
      }
    } catch {
      setConfirmResult({
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Không thể kết nối server. Vui lòng thử lại.",
        },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setShowConfirmDialog(false);
  }, [voucherData, user, confirmMutation, invalidateRelatedQueries]);

  // Handle scan new
  const handleScanNew = useCallback(() => {
    router.replace("/(app)/scan");
  }, [router]);

  // Handle go to dashboard
  const handleGoDashboard = useCallback(() => {
    router.replace("/(app)/home");
  }, [router]);

  // Handle manual input new
  const handleManualNew = useCallback(() => {
    router.replace("/(app)/manual");
  }, [router]);

  // Error state - invalid voucher (from navigation params)
  if (!voucherData && statusFromParams) {
    const statusConfig =
      STATUS_CONFIG[statusFromParams] ?? STATUS_CONFIG.UNKNOWN_ERROR;

    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <ResultBanner
          type="error"
          title={statusConfig.label}
          message={errorFromParams ?? statusConfig.label}
          onPrimaryAction={handleRetry}
          onSecondaryAction={isFromManual ? handleManualNew : handleScanNew}
          primaryActionLabel="Thử lại"
          secondaryActionLabel={isFromManual ? "Nhập mã khác" : "Quét lại"}
        />
      </View>
    );
  }

  // Loading state (no data yet)
  if (isLoadingDetail && !voucherData) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  // Error state - API error and no cache
  if (!voucherData && (detailError || !validateResponse?.success)) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResultBanner
          type="error"
          title="Không thể tải voucher"
          message={detailError?.message ?? "Vui lòng thử lại"}
          onPrimaryAction={handleRetry}
          onSecondaryAction={isFromManual ? handleManualNew : handleScanNew}
          primaryActionLabel="Thử lại"
          secondaryActionLabel={isFromManual ? "Nhập mã khác" : "Quét lại"}
        />
      </View>
    );
  }

  // Success state after confirm
  if (confirmResult?.success) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ResultBanner
            type="success"
            title="Xác nhận thành công!"
            message="Voucher đã được sử dụng thành công."
            data={confirmResult.data}
            onPrimaryAction={isFromManual ? handleManualNew : handleScanNew}
            onSecondaryAction={handleGoDashboard}
            primaryActionLabel={
              isFromManual ? "Nhập voucher khác" : "Quét voucher mới"
            }
            secondaryActionLabel="Quay lại Dashboard"
          />
        </ScrollView>
      </View>
    );
  }

  // Error state after confirm fail
  if (confirmResult && !confirmResult.success) {
    const statusConfig =
      STATUS_CONFIG[confirmResult.error?.code as keyof typeof STATUS_CONFIG] ??
      STATUS_CONFIG.UNKNOWN_ERROR;

    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ResultBanner
            type="error"
            title={statusConfig.label}
            message={confirmResult.error?.message ?? statusConfig.label}
            onPrimaryAction={handleRetry}
            onSecondaryAction={isFromManual ? handleManualNew : handleScanNew}
            primaryActionLabel="Thử lại"
            secondaryActionLabel={
              isFromManual ? "Nhập voucher khác" : "Quét voucher khác"
            }
          />
        </ScrollView>
      </View>
    );
  }

  // Normal detail view - voucherData is guaranteed non-null here
  if (!voucherData) {
    return null;
  }

  const canConfirm =
    voucherData.usageStatus === "Unused" || params.canConfirm === "true";

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin voucher</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Voucher Info */}
        <View style={styles.section}>
          <VoucherCard
            voucher={voucherData.voucher}
            voucherCode={voucherData.voucherCode}
            validFrom={voucherData.validFrom}
            validTo={voucherData.validTo}
            usedAt={voucherData.usedAt}
          />
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <CustomerCard customer={voucherData.customer} />
        </View>

        {/* Branch Info */}
        <View style={styles.section}>
          <BranchCard
            branches={voucherData.applicableBranches}
            currentBranchId={user?.branchId}
            partnerName={voucherData.voucher.partnerName}
          />
        </View>

        {/* Usage Status */}
        <View style={styles.section}>
          <View style={styles.statusSection}>
            <Text style={styles.statusSectionTitle}>Trạng thái sử dụng</Text>
            <StatusBadge
              status={
                voucherData.usageStatus === "Unused" ? "VALID" : "ALREADY_USED"
              }
              size="large"
            />
          </View>
        </View>

        {/* Confirm Button */}
        <View style={styles.buttonSection}>
          {canConfirm ? (
            <PrimaryButton
              onPress={handleConfirm}
              loading={confirmMutation.isPending}
              disabled={confirmMutation.isPending}
              size="large"
              accessibilityLabel="Xác nhận sử dụng voucher"
              accessibilityHint="Nhấn để xác nhận voucher đã được sử dụng"
            >
              Xác nhận sử dụng
            </PrimaryButton>
          ) : (
            <View style={styles.disabledButtonContainer}>
              <Text style={styles.disabledText}>
                Voucher không thể xác nhận
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Confirm Dialog */}
      <ConfirmDialog
        visible={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSubmit}
        isLoading={confirmMutation.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
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
  section: {
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.xl,
  },
  statusSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.sm,
  },
  statusSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  buttonSection: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  disabledButtonContainer: {
    backgroundColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  disabledText: {
    fontSize: fontSize.md,
    color: colors.textTertiary,
  },
});
