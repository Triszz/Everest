/**
 * Auth Layout
 * ============================================================
 * Layout cho các màn hình authentication
 */

import { Stack } from "expo-router";
import { colors } from "../../src/theme";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
