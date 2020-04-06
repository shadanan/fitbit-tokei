import * as messaging from "messaging";
import { geolocation } from "geolocation";
import { API_KEY } from "../common/secrets";
import { Weather } from "../common/weather";

function queryOpenWeather() {
  geolocation.getCurrentPosition(async (position) => {
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${position.coords.latitude}` +
      `&lon=${position.coords.longitude}` +
      `&APPID=${API_KEY}`;
    const response = await fetch(url);
    const weather: Weather = await response.json();
    sendWeatherDataToDevice(weather);
  });
}

function sendWeatherDataToDevice(weather: Weather) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(weather);
  }
}

messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt.data && evt.data.command == "weather") {
    queryOpenWeather();
  }
});
