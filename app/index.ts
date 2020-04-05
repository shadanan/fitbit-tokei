import document from "document";
import clock from "clock";
import { me } from "appbit";
import { BodyPresenceSensor } from "body-presence";
import { HeartRateSensor } from "heart-rate";

let _date = "APR 8";
let _temperature = "25°C";
const MONTH_NAMES = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

function setDate(date: Date) {
  _date = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
  updateDateAndTemperature();
}

function setTemperature(temperature: number) {
  _temperature = `${temperature}°C`;
  updateDateAndTemperature();
}

function updateDateAndTemperature() {
  const dateAndTempText = document.getElementById("dateAndTemperature");
  dateAndTempText.text = `${_date}  •  ${_temperature}`;
}

function format12Hour(date: Date): string {
  const hours = date.getHours() % 12 || 12;
  const minutes = ("0" + date.getMinutes()).slice(-2);
  return `${hours}:${minutes}`;
}

function setTime(date: Date) {
  const clockText = document.getElementById("clockText");
  clockText.text = `${format12Hour(date)}`;
}

clock.granularity = "minutes"; // seconds, minutes, hours
clock.addEventListener("tick", (tickEvent) => {
  setDate(tickEvent.date);
  setTime(tickEvent.date);
});

const hrm =
  me.permissions.granted("access_heart_rate") && HeartRateSensor
    ? new HeartRateSensor({ frequency: 3 })
    : null;

if (hrm) {
  hrm.addEventListener("reading", () => {
    const heartRateText = document.getElementById("heartRate");
    heartRateText.text = `${hrm.heartRate}`;
  });
  hrm.start();
}

const body =
  me.permissions.granted("access_activity") && BodyPresenceSensor
    ? new BodyPresenceSensor()
    : null;

if (body) {
  body.addEventListener("reading", () => {
    if (!body.present) {
      hrm.stop();
      const heartRateText = document.getElementById("heartRate");
      heartRateText.text = "--";
    } else {
      hrm.start();
    }
  });
  body.start();
}
