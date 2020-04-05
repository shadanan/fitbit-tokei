import document from "document";
import clock from "clock";

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
clock.ontick = function (evt) {
  setDate(evt.date);
  setTime(evt.date);
};
