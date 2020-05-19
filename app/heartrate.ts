import { me as appbit } from "appbit";
import { BodyPresenceSensor } from "body-presence";
import { display } from "display";
import { HeartRateSensor } from "heart-rate";

export function monitorHeartRate(callback: (heartRate: number | null) => void) {
  if (
    appbit.permissions.granted("access_heart_rate") &&
    appbit.permissions.granted("access_activity") &&
    HeartRateSensor &&
    BodyPresenceSensor
  ) {
    const hrm = new HeartRateSensor({ frequency: 1 });
    const body = new BodyPresenceSensor();

    hrm.addEventListener("reading", () => {
      callback(hrm.heartRate);
    });

    body.addEventListener("reading", () => {
      if (!body.present) {
        hrm.stop();
        callback(null);
      } else {
        hrm.start();
      }
    });

    display.addEventListener("change", () => {
      display.on ? hrm.start() : hrm.stop();
    });

    hrm.start();
    body.start();
  }
}
