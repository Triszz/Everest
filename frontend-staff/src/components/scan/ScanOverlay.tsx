/**
 * ScanOverlay Component
 * ============================================================
 * Overlay với khung scan ở giữa màn hình
 */

import { View, StyleSheet, Dimensions } from "react-native";
import { colors, borderRadius } from "../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

interface ScanOverlayProps {
  children?: React.ReactNode;
}

export function ScanOverlay({ children }: ScanOverlayProps) {
  return (
    <View style={styles.container}>
      {/* Top overlay */}
      <View style={styles.overlayTop} />

      {/* Middle row */}
      <View style={styles.middleRow}>
        {/* Left overlay */}
        <View style={styles.overlaySide} />

        {/* Scan area */}
        <View style={styles.scanArea}>
          {/* Corner decorations */}
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />

          {/* Scan line animation container */}
          <View style={styles.scanLineContainer}>
            {/* Scan line */}
            <View style={styles.scanLine} />
          </View>

          {/* Children (ví dụ: error message) */}
          {children}
        </View>

        {/* Right overlay */}
        <View style={styles.overlaySide} />
      </View>

      {/* Bottom overlay */}
      <View style={styles.overlayBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  middleRow: {
    flexDirection: "row",
    height: SCAN_AREA_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: colors.white,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: borderRadius.md,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: borderRadius.md,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: borderRadius.md,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: borderRadius.md,
  },
  scanLineContainer: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    height: "100%",
    overflow: "hidden",
  },
  scanLine: {
    height: 2,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
});
