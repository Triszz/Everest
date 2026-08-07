/**
 * VoucherCard Component
 * ============================================================
 * Hiển thị thông tin voucher
 */

import { View, Text, StyleSheet } from "react-native";
import type { VoucherInfo } from "../../types";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from "../../theme";

interface VoucherCardProps {
  voucher: VoucherInfo;
  voucherCode: string;
  validFrom: string;
  validTo: string;
  usedAt?: string | null;
}

export function VoucherCard({
  voucher,
  voucherCode,
  validFrom,
  validTo,
  usedAt,
}: VoucherCardProps) {
  // Format datetime theo locale vi-VN: dd/MM/yyyy HH:mm
  // Ví dụ: "07/08/2026 08:00" — khớp format các màn khác trong app
  // (HistoryItem, ResultBanner).
  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    const datePart = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} ${timePart}`;
  };

  // Hiển thị "Đã sử dụng":
  // - Nếu usedAt !== null → format thời gian
  // - Nếu usedAt === null/undefined → "—" (voucher chưa dùng)
  const formatUsedAt = (): string => {
    if (!usedAt) return "—";
    return formatDateTime(usedAt);
  };

  return (
    <View style={styles.container}>
      {/* Image */}
      {!voucher.imageUrl && (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>🎫</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {voucher.title}
        </Text>

        {voucher.description && (
          <Text style={styles.description} numberOfLines={2}>
            {voucher.description}
          </Text>
        )}

        <View style={styles.codeRow}>
          <Text style={styles.codeLabel}>Mã:</Text>
          <Text style={styles.codeValue}>{voucherCode}</Text>
        </View>

        {/* Có hiệu lực */}
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Có hiệu lực:</Text>
          <Text style={styles.dateValue}>{formatDateTime(validFrom)}</Text>
        </View>

        {/* Hết hạn */}
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Hết hạn:</Text>
          <Text style={styles.dateValue}>{formatDateTime(validTo)}</Text>
        </View>

        {/* Đã sử dụng */}
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Đã sử dụng:</Text>
          <Text style={styles.dateValue}>{formatUsedAt()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    ...shadows.md,
  },
  image: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 64,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  codeLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  codeValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    fontFamily: "monospace",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  dateValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
});
