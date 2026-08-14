/**
 * App Layout - Main authenticated screens
 * ============================================================
 * Bottom Tab Navigation với AuthGuard
 *
 * Bottom Tab safe-area handling:
 *   - Lấy `bottom` inset từ `useSafeAreaInsets()` (đã được cung cấp bởi
 *     `SafeAreaProvider` ở root layout).
 *   - `bottom > 0` trên:
 *       • iPhone có Home Indicator (~34)
 *       • Android 3-button navigation (~24-48 tùy OEM)
 *       • Android gesture navigation (~16-24)
 *   - `bottom === 0` trên thiết bị không có system nav bar.
 *
 *   Padding-bottom tab bar = max(bottom, MIN_PADDING) để:
 *     - Tránh bị hệ thống che (nếu bottom > 0)
 *     - Đảm bảo tối thiểu MIN_PADDING cho mọi thiết bị (label không dính mép)
 *
 *   Height = BASE_TAB_HEIGHT + bottom để label/icon không bị đẩy lên cao
 *   trên thiết bị có inset lớn.
 */

import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthGuard } from "../../src/components/auth";
import { colors, fontSize, spacing } from "../../src/theme";

// Tab bar geometry constants — dựa trên layout 4 tab (icon 32 + label xs)
// 70 = paddingTop(8) + icon(32) + gap(2) + label(~18) + paddingBottom(8) + 2
const BASE_TAB_HEIGHT = 70;
const MIN_BOTTOM_PADDING = spacing.sm; // 8 — đảm bảo label không dính mép dưới

// Tab icon component
const TabIcon = ({
  label,
  focused,
}: {
  label: string;
  focused: boolean;
}) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
    <Text style={[styles.iconText, focused && styles.iconTextFocused]}>
      {label}
    </Text>
  </View>
);

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  // Math.max(bottom, 0) đề phòng một số thiết bị trả về bottom âm
  // Math.max(bottom, MIN_BOTTOM_PADDING) đảm bảo paddingBottom tối thiểu
  const bottomInset = Math.max(insets.bottom, 0);
  const tabBarPaddingBottom = Math.max(bottomInset, MIN_BOTTOM_PADDING);

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            ...styles.tabBar,
            height: BASE_TAB_HEIGHT + bottomInset,
            paddingBottom: tabBarPaddingBottom,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}
        // ✅ RCA Bug 2: Mặc định Bottom Tabs của React Navigation có
        // backBehavior="firstRoute" → khi router.back() được gọi mà stack
        // của tab hiện tại rỗng, navigator nhảy về tab ĐẦU TIÊN (Home).
        //
        // Hậu quả: History → click voucher → push voucher/[id] → back()
        // → về Home (KHÔNG phải History) vì push không thực sự vào stack
        // của History tab.
        //
        // Fix: backBehavior="history" — router.back() sẽ đi theo history
        // thực sự của user (đúng tab user đã mở từ đó).
        backBehavior="history"
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Trang chủ",
            tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: "Quét QR",
            tabBarIcon: ({ focused }) => <TabIcon label="📷" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="manual"
          options={{
            title: "Nhập mã",
            tabBarIcon: ({ focused }) => <TabIcon label="⌨️" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "Lịch sử",
            tabBarIcon: ({ focused }) => <TabIcon label="📋" focused={focused} />,
          }}
        />
        {/* Hidden tabs — chỉ dùng để khai báo route, không hiển thị trên tab bar.
            Voucher detail (/voucher/[id]) được push lên Stack từ Scan/Manual/History,
            KHÔNG phải là Tab. Nếu không khai báo kèm `href: null`, Expo Router
            sẽ tự động tạo tab cho mọi file .tsx trong folder (app). */}
        <Tabs.Screen
          name="voucher/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    // height & paddingBottom được override bằng inline style dựa trên insets.bottom
    paddingTop: spacing.sm,
  },
  tabBarLabel: {
    fontSize: fontSize.xs,
    fontWeight: "500",
  },
  tabBarItem: {
    paddingVertical: spacing.xs,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerFocused: {
    transform: [{ scale: 1.1 }],
  },
  iconText: {
    fontSize: 20,
    opacity: 0.7,
  },
  iconTextFocused: {
    opacity: 1,
  },
});
