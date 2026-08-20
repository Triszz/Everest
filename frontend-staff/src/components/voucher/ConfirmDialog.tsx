/**
 * ConfirmDialog Component
 * ============================================================
 * Dialog xác nhận trước khi confirm voucher
 */

import { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from "../../theme";
import { PrimaryButton } from "../ui";

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          {/* Warning icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>⚠️</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Xác nhận sử dụng voucher</Text>

          {/* Description */}
          <Text style={styles.description}>
            Nếu xác nhận, voucher sẽ được đánh dấu đã sử dụng và không thể hoàn tác.
          </Text>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
              accessibilityLabel="Huỷ"
              accessibilityHint="Không xác nhận, quay lại"
              accessibilityRole="button"
            >
              <Text style={styles.cancelText}>Huỷ</Text>
            </TouchableOpacity>

            <View style={styles.confirmButtonWrapper}>
              <PrimaryButton
                onPress={onConfirm}
                loading={isLoading}
                disabled={isLoading}
                accessibilityLabel="Xác nhận"
                accessibilityHint="Xác nhận sử dụng voucher"
              >
                Xác nhận
              </PrimaryButton>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xxl,
  },
  dialog: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    ...shadows.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.warningBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  buttons: {
    flexDirection: "row",
    width: "100%",
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  confirmButtonWrapper: {
    flex: 1,
  },
});
