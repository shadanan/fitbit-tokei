import document from "document";
import clock from "clock";

function zeropad(number: number): string {
  return ("0" + number).slice(-2);
}

function format12Hour(date: Date): string {
  const hours = date.getHours() % 12 || 12;
  const minutes = zeropad(date.getMinutes());
  return `${hours}:${minutes}`;
}

let clockText = document.getElementById("clockText");

clock.granularity = "minutes"; // seconds, minutes, hours

clock.ontick = function (evt) {
  const date = evt.date;
  clockText.text = `${format12Hour(date)}`;
};
