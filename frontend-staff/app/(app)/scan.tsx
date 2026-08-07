/**
 * Scan Screen
 * ============================================================
 * Màn hình quét QR voucher
 *
 * Features:
 * - Camera permission handling
 * - QR scanning với expo-camera
 * - Anti-duplicate (pause/resume camera)
 * - Validate voucher via API
 * - Navigate to detail on VALID
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Alert, Platform } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { CameraView, BarcodeScanningResult } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useCameraPermission } from "../../src/hooks/useCameraPermission";
import { useValidateVoucher } from "../../src/hooks/useRedemption";
import { validateAndParseQr } from "../../src/utils/qr";
import { STATUS_CONFIG } from "../../src/constants";
import { colors, spacing, fontSize, fontWeight } from "../../src/theme";
import {
  ScannerHeader,
  ScanOverlay,
  PermissionView,
  ScanLoadingOverlay,
} from "../../src/components/scan";
import type { RedemptionStatusCode } from "../../src/types";

// Navigation params type
export type ScanNavigationParams = {
  voucherCode?: string;
};

export default function ScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // ✅ RCA Bug 1: useState lock chậm vì React state update async & batched.
  // Camera expo-camera fires onBarcodeScanned 30+ lần/giây cho cùng 1 QR.
  // isState=false vẫn được pass trong closure của callback nhiều lần trước
  // khi React commit state → mutation bị gọi nhiều lần → Alert duplicate.
  //
  // Fix: dùng useRef cho lock — ref update synchronously, không qua React render.
  // Đây là pattern chuẩn cho runtime guards trong React (không phải workaround).
  const isProcessingRef = useRef(false);

  // Permission
  const {
    isGranted,
    isDenied,
    isUndetermined,
    requestPermission,
    openSettings,
  } = useCameraPermission();

  // Validate mutation
  const validateMutation = useValidateVoucher();

  // Pause camera scanner
  const pauseCamera = useCallback(() => {
    try {
      // Try to pause the camera
      if (cameraRef.current && "pause" in cameraRef.current) {
        (cameraRef.current as unknown as { pause: () => void }).pause();
      }
    } catch {
      // Ignore if pause not available
    }
  }, []);

  // Resume camera scanner
  const resumeCamera = useCallback(() => {
    try {
      if (cameraRef.current && "resume" in cameraRef.current) {
        (cameraRef.current as unknown as { resume: () => void }).resume();
      }
    } catch {
      // Ignore if resume not available
    }
  }, []);

  // Handle barcode scan
  const handleBarCodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      // ✅ RCA Bug 1: Synchronous lock qua useRef. Ref update KHÔNG qua React
      // render cycle nên chặn được race condition khi camera fires 30+ lần/giây.
      // Trước đây isLocked là useState → nhiều callback closure vẫn thấy
      // isLocked=false trong cùng một tick → mutation bị gọi nhiều lần.
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        // Skip if user explicitly paused scanning
        if (!isScanning) {
          return;
        }

      const rawData = result.data;

      // Validate QR format (source="qr" cho camera scan)
      const { isValid, code, error } = validateAndParseQr(rawData, "qr");

        if (!isValid || !code) {
          // Invalid QR format - show error and continue scanning
          setScanError(error ?? "Mã QR không hợp lệ");

          // Haptic feedback
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } catch {
            // Haptics may not be available
          }

          // Clear error after 2 seconds
          setTimeout(() => setScanError(null), 2000);
          return;
        }

        // Valid QR - lock scanner (both ref & state)
        setIsLocked(true);
        setIsScanning(false);
        setIsValidating(true);
        setScanError(null);

        // Pause camera to stop scanning
        pauseCamera();

        try {
          // Call validate API
          const response = await validateMutation.mutateAsync(code);

          if (response.success && response.status === "VALID") {
            // Valid voucher - vibrate success
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {
              // Ignore
            }

            // Navigate to voucher detail - only pass IDs, use React Query for data
            router.push({
              pathname: "/(app)/voucher/[id]",
              params: {
                id: response.data.issuedVoucherId.toString(),
                voucherCode: code,
                isManual: "false",
              },
            });
          } else {
            // Invalid voucher - show status error
            const statusCode = response.status as RedemptionStatusCode;
            const statusConfig = STATUS_CONFIG[statusCode] ?? STATUS_CONFIG.UNKNOWN_ERROR;

            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {
              // Ignore
            }

            Alert.alert(
              `❌ ${statusConfig.label}`,
              response.error?.message ?? "Voucher không hợp lệ",
              [
                {
                  text: "Quét lại",
                  onPress: resumeScanning,
                },
              ],
            );
          }
        } catch {
          // Network error
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } catch {
            // Ignore
          }

          Alert.alert(
            "⚠️ Lỗi kết nối",
            "Không thể kết nối server. Vui lòng thử lại.",
            [
              {
                text: "Thử lại",
                onPress: resumeScanning,
              },
            ],
          );
        } finally {
          setIsValidating(false);
        }
      } finally {
        // Unlock ref sau khi callback kết thúc. Lưu ý: KHÔNG unlock ở
        // resumeScanning vì ref đã được unlock ở finally của handler.
        // Trong success path, navigator đẩy user sang màn khác nên
        // unlock không quan trọng, nhưng vẫn an toàn.
        isProcessingRef.current = false;
      }
    },
    [isScanning, validateMutation, pauseCamera, router],
  );

  // Resume scanning after dialog
  const resumeScanning = useCallback(() => {
    setIsLocked(false);
    setIsScanning(true);
    setScanError(null);
    resumeCamera();
  }, [resumeCamera]);

  // Handle back button
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Request permission on mount if undetermined
  useEffect(() => {
    if (isUndetermined) {
      requestPermission();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Ensure camera is stopped on unmount
      try {
        if (cameraRef.current && "pause" in cameraRef.current) {
          (cameraRef.current as unknown as { pause: () => void }).pause();
        }
      } catch {
        // Ignore
      }
    };
  }, []);

  // Reset scanner state mỗi khi screen focus lại (sau khi quay lại từ /voucher/[id])
  // Trước đó: sau khi navigate tới voucher detail, state isScanning=false được
  // giữ nguyên → <CameraView active={false}> → camera không bật lại khi back.
  useFocusEffect(
    useCallback(() => {
      setIsLocked(false);
      setIsScanning(true);
      setScanError(null);
      setIsValidating(false);
      resumeCamera();
    }, [resumeCamera]),
  );

  // Permission not granted
  if (!isGranted) {
    return (
      <View style={styles.container}>
        <ScannerHeader onBack={handleBack} />
        <PermissionView
          onRequestPermission={requestPermission}
          onOpenSettings={openSettings}
          isDenied={isDenied}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        active={isScanning}
        onBarcodeScanned={isScanning && !isLocked ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* Overlay */}
      <ScanOverlay>
        {/* Scan error message */}
        {scanError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>{scanError}</Text>
          </View>
        )}
      </ScanOverlay>

      {/* Header */}
      <ScannerHeader onBack={handleBack} />

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instruction}>
          Đưa mã QR vào khung để quét
        </Text>
      </View>

      {/* Loading overlay */}
      {isValidating && <ScanLoadingOverlay />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  instructionContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instruction: {
    fontSize: fontSize.md,
    color: colors.white,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 20,
  },
  errorContainer: {
    position: "absolute",
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.dangerBg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  errorMessage: {
    fontSize: fontSize.sm,
    color: colors.danger,
    textAlign: "center",
  },
});
