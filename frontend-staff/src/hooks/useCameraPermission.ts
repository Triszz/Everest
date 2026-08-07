/**
 * useCameraPermission Hook
 * ============================================================
 * Hook để quản lý camera permission
 */

import { useState, useCallback } from "react";
import { Linking, Platform } from "react-native";
import {
  Camera,
  useCameraPermissions,
  type PermissionResponse,
} from "expo-camera";

export type PermissionStatus = "undetermined" | "granted" | "denied";

interface UseCameraPermissionReturn {
  status: PermissionStatus;
  isGranted: boolean;
  isDenied: boolean;
  isUndetermined: boolean;
  requestPermission: () => Promise<boolean>;
  openSettings: () => void;
}

export function useCameraPermission(): UseCameraPermissionReturn {
  const [permissionResponse, requestPermission] = useCameraPermissions();

  const status: PermissionStatus = permissionResponse?.granted
    ? "granted"
    : permissionResponse?.canAskAgain
    ? "undetermined"
    : "denied";

  const openSettings = useCallback(() => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  }, []);

  const handleRequestPermission = useCallback(async (): Promise<boolean> => {
    const result: PermissionResponse = await requestPermission();
    return result.granted;
  }, [requestPermission]);

  return {
    status,
    isGranted: permissionResponse?.granted ?? false,
    isDenied: status === "denied",
    isUndetermined: status === "undetermined",
    requestPermission: handleRequestPermission,
    openSettings,
  };
}
