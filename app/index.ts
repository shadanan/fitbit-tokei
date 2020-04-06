import document from "document";
import clock from "clock";
import { me as appbit } from "appbit";
import { preferences, units } from "user-settings";
import { today } from "user-activity";
import { monitorWeather } from "./weather";
import { monitorHeartRate } from "./heartrate";
import { monitorBattery } from "./battery";

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

clock.granularity = "minutes"; // seconds, minutes, hours
clock.addEventListener("tick", (tickEvent) => {
  updateDateAndTime(tickEvent.date);
  updateActivity();
});

monitorBattery((charge) => {
  const batteryPct = document.getElementById("batteryPct") as TextElement;
  batteryPct.text = `${Math.floor(charge)}%`;
  const batteryRect = document.getElementById("batteryRect") as RectElement;
  batteryRect.width = (32 * charge) / 100;
});

monitorHeartRate((heartRate) => {
  const heartRateText = document.getElementById("heartRate");
  if (heartRate) {
    heartRateText.text = `${heartRate}`;
  } else {
    heartRateText.text = "--";
  }
});

document.getElementById("temperature").text = `--°${units.temperature}`;
monitorWeather((weather) => {
  const temperature = document.getElementById("temperature") as TextElement;
  if (units.temperature === "F") {
    temperature.text = `${Math.round((weather.main.temp * 9) / 5 - 459.67)}°F`;
  } else {
    temperature.text = `${Math.round(weather.main.temp - 273.15)}°C`;
  }
  const weatherIcon = document.getElementById("weatherIcon") as ImageElement;
  weatherIcon.href = `${weather.weather[0].icon.slice(0, 2)}.png`;
});
