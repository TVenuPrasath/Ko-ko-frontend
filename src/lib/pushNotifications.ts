import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { api } from "@/lib/api";

let initialized = false;
let lastToken = "";

export async function setupPushNotifications(authToken?: string) {
  if (initialized || !Capacitor.isNativePlatform()) return;
  initialized = true;

  // Ensure token is in localStorage before any listener fires
  if (authToken) localStorage.setItem("token", authToken);

  try {
    let permission = await PushNotifications.checkPermissions();

    if (permission.receive !== "granted") {
      permission = await PushNotifications.requestPermissions();
    }

    if (permission.receive !== "granted") return;

    await PushNotifications.addListener("registration", async (token) => {
      console.log("[FCM] token received:", token.value);
      if (!token.value || token.value === lastToken) return;
      lastToken = token.value;

      const platform = Capacitor.getPlatform();
      try {
        const result = await api.registerDeviceToken(token.value, platform === "ios" ? "ios" : "android");
        console.log("[FCM] token registered to backend:", result);
      } catch (err) {
        console.error("[FCM] failed to register token to backend:", err);
      }
    });

    await PushNotifications.addListener("registrationError", (error) => {
      console.error("[FCM] registration error:", error);
    });

    await PushNotifications.register();
  } catch (error) {
    console.error("[FCM] Unable to setup push notifications:", error);
  }
}
