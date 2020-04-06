import * as messaging from "messaging";
import { Weather } from "../common/weather";

function fetchWeather() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    console.log("Updating weather...");
    messaging.peerSocket.send({
      command: "weather",
    });
  }
}

export function monitorWeather(
  callback: (weather: Weather) => void,
  timeout: number
) {
  messaging.peerSocket.addEventListener("open", (evt) => {
    fetchWeather();
  });

  messaging.peerSocket.addEventListener("message", (evt) => {
    const weather = evt.data as Weather | undefined;
    if (weather) {
      callback(weather);
    }
  });

  messaging.peerSocket.addEventListener("error", (err) => {
    console.log("Connection error: " + err.code + " - " + err.message);
  });

  setInterval(fetchWeather, timeout);
}
