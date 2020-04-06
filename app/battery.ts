import { battery } from "power";

export function monitorBattery(callback: (charge: number) => void) {
  battery.addEventListener("change", () => {
    callback(battery.chargeLevel);
  });

  callback(battery.chargeLevel);
}
