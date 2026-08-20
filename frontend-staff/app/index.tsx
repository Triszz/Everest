/**
 * Root Index - Entry redirect
 * ============================================================
 * File này KHÔNG chứa UI.
 * Nhiệm vụ duy nhất: redirect user về đúng nhóm route
 * dựa trên trạng thái đăng nhập.
 *
 * - Đã đăng nhập → /(app)
 * - Chưa đăng nhập → /(auth)
 */

import { Redirect } from "expo-router";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useIsAuthenticated } from "../src/hooks/useAuth";
import { NAV_ROUTES } from "../src/constants";
import { colors } from "../src/theme";

export default function Index() {
  const { isAuthenticated, isLoading } = useIsAuthenticated();

  // Trong khi đọc SecureStore → hiển thị loading ngắn
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Redirect
      href={isAuthenticated ? NAV_ROUTES.APP.HOME : NAV_ROUTES.AUTH.LOGIN}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
