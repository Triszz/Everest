/**
 * Root Layout
 * ============================================================
 * Cấu hình providers và initial route
 */

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryProvider } from "../src/providers/QueryProvider";

export default function RootLayout() {
  return (
    <QueryProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </QueryProvider>
  );
}
