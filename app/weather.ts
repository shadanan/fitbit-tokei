import * as messaging from "messaging";
import { display } from "display";
import { Weather } from "../common/weather";

const TIMEOUT = 30 * 60 * 1000;
let lastUpdated = 0;

function fetchWeather() {
  const timeSinceUpdate = Date.now() - lastUpdated;
  if (timeSinceUpdate < TIMEOUT) {
    console.log(`Skipping weather update: ${timeSinceUpdate} < ${TIMEOUT}`);
    return;
  }

  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    console.log("Updating weather...");
    messaging.peerSocket.send({
      command: "weather",
    });
  }
}

export function monitorWeather(callback: (weather: Weather) => void) {
  messaging.peerSocket.addEventListener("open", (evt) => {
    fetchWeather();
  });

  messaging.peerSocket.addEventListener("message", (evt) => {
    const weather = evt.data as Weather | undefined;
    if (weather) {
      lastUpdated = Date.now();
      callback(weather);
    }
  });

  messaging.peerSocket.addEventListener("error", (err) => {
    console.log("Connection error: " + err.code + " - " + err.message);
  });

  display.addEventListener("change", () => {
    if (display.on) {
      fetchWeather();
    }
  });

  setInterval(fetchWeather, TIMEOUT);
}
