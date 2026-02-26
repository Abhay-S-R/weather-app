//Everything is in milliseconds
export function toLocalTime(unixTime, timeMilliSecs, showSeconds=false){
  const date = new Date(unixTime+timeMilliSecs);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const mins = String(date.getUTCMinutes()).padStart(2, "0");
  const secs = String(date.getUTCSeconds()).padStart(2, "0");

  return `${hours}:${mins}${showSeconds ? `:${secs}` : ""}` ;
}