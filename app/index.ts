import * as messaging from "messaging";
import document from "document";
import clock from "clock";
import { battery } from "power";
import { me as appbit } from "appbit";
import { preferences } from "user-settings";
import { today } from "user-activity";
import { BodyPresenceSensor } from "body-presence";
import { HeartRateSensor } from "heart-rate";
import { Weather } from "../common/weather";

function updateWeather(weather: Weather) {
  const temperature = document.getElementById("temperature") as TextElement;
  temperature.text = `${Math.round(weather.main.temp - 273.15)}°C`;
  const weatherIcon = document.getElementById("weatherIcon") as ImageElement;
  weatherIcon.href = `${weather.weather[0].icon.slice(0, 2)}.png`;
}

function updateBatteryLevel() {
  const batteryPercent = document.getElementById(
    "batteryPercent"
  ) as TextElement;
  batteryPercent.text = `${Math.floor(battery.chargeLevel)}%`;

  const batteryRect = document.getElementById("batteryRect") as RectElement;
  batteryRect.width = (32 * battery.chargeLevel) / 100;
}

function updateActivity() {
  const stepCount = document.getElementById("stepCount") as TextElement;
  const calories = document.getElementById("calories") as TextElement;
  if (appbit.permissions.granted("access_activity")) {
    stepCount.text = today.adjusted.steps.toLocaleString(undefined, {
      useGrouping: true,
    });
    calories.text = today.adjusted.calories.toLocaleString(undefined, {
      useGrouping: true,
    });
  }
}

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

function updateDateAndTime(date: Date) {
  const clockText = document.getElementById("clockText") as TextElement;
  clockText.text = `${formatTime(date)}`;
  const dateText = document.getElementById("dateText") as TextElement;
  dateText.text = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

function formatTime(date: Date): string {
  const hours =
    preferences.clockDisplay == "12h"
      ? date.getHours() % 12 || 12
      : ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  return `${hours}:${minutes}`;
}

clock.granularity = "minutes"; // seconds, minutes, hours
clock.addEventListener("tick", (tickEvent) => {
  updateDateAndTime(tickEvent.date);
  updateActivity();
});

const hrm =
  appbit.permissions.granted("access_heart_rate") && HeartRateSensor
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
  appbit.permissions.granted("access_activity") && BodyPresenceSensor
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

battery.addEventListener("change", updateBatteryLevel);
updateBatteryLevel();

function fetchWeather() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({
      command: "weather",
    });
  }
}

messaging.peerSocket.addEventListener("open", (evt) => {
  fetchWeather();
});

messaging.peerSocket.addEventListener("message", (evt) => {
  const weather = evt.data as Weather | undefined;
  if (weather) {
    updateWeather(weather);
  }
});

setInterval(fetchWeather, 20 * 1000 * 60);
