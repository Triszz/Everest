/**
 * DateRangePicker Component
 * ============================================================
 * Picker chọn date range (compact UI - không dùng native picker)
 */

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows, touchTarget } from "../../theme";

interface DateRangePickerProps {
  dateFrom: string | null;
  dateTo: string | null;
  onChange: (from: string | null, to: string | null) => void;
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onChange,
}: DateRangePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempFrom, setTempFrom] = useState(dateFrom ?? "");
  const [tempTo, setTempTo] = useState(dateTo ?? "");

  const hasRange = !!dateFrom || !!dateTo;

  const formatDate = (iso: string | null) => {
    if (!iso) return "--/--/----";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "--/--/----";
    }
  };

  const handleApply = () => {
    onChange(tempFrom || null, tempTo || null);
    setModalVisible(false);
  };

  const handleClear = () => {
    setTempFrom("");
    setTempTo("");
    onChange(null, null);
    setModalVisible(false);
  };

  const handleOpen = () => {
    setTempFrom(dateFrom ?? "");
    setTempTo(dateTo ?? "");
    setModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, hasRange && styles.triggerActive]}
        onPress={handleOpen}
        accessibilityLabel="Chọn khoảng thời gian"
        accessibilityHint="Mở date range picker"
        accessibilityRole="button"
      >
        <Text style={styles.icon}>📅</Text>
        <Text style={[styles.triggerText, hasRange && styles.triggerTextActive]}>
          {hasRange
            ? `${formatDate(dateFrom)} → ${formatDate(dateTo)}`
            : "Chọn ngày"}
        </Text>
        {hasRange && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearIcon}
            accessibilityLabel="Xóa date range"
            accessibilityRole="button"
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn khoảng thời gian</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Từ ngày</Text>
              <TextInput
                style={styles.input}
                value={tempFrom}
                onChangeText={setTempFrom}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Đến ngày</Text>
              <TextInput
                style={styles.input}
                value={tempTo}
                onChangeText={setTempTo}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Hủy"
                accessibilityRole="button"
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonClear]}
                onPress={handleClear}
                accessibilityLabel="Xóa"
                accessibilityRole="button"
              >
                <Text style={styles.modalButtonText}>Xóa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonApply]}
                onPress={handleApply}
                accessibilityLabel="Áp dụng"
                accessibilityRole="button"
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextApply]}>
                  Áp dụng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: touchTarget.min,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  triggerActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight ?? colors.background,
  },
  icon: {
    fontSize: fontSize.md,
    marginRight: spacing.sm,
  },
  triggerText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  triggerTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  clearIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  clearText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 360,
    ...shadows.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    height: touchTarget.min,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    minHeight: touchTarget.min,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  modalButtonCancel: {
    backgroundColor: colors.background,
  },
  modalButtonClear: {
    backgroundColor: colors.background,
  },
  modalButtonApply: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  modalButtonTextApply: {
    color: colors.white,
  },
});
