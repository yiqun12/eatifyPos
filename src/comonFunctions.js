import moment from 'moment-timezone';


//convert 1/2/2024, 05:00:00 PM into 2024-01-02-00-00-00-00

export function format12Oclock(dateString) {
  let date = new Date(dateString);

  // Resetting time to midnight
  date.setHours(0, 0, 0, 0);

  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  let day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}-00-00-00-00`;
}


export function parseCustomFormatDate(customDateString) {
  const parts = customDateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript Date
  const day = parseInt(parts[2], 10);
  const hours = parseInt(parts[3], 10);
  const minutes = parseInt(parts[4], 10);
  const seconds = parseInt(parts[5], 10);

  return new Date(year, month, day, hours, minutes, seconds);
}
//add one day 2024-01-02-00-00-00-00 into 2024-01-03-00-00-00-00

export function addOneDayAndFormat(customDateString) {
  let date = parseCustomFormatDate(customDateString);

  // Add one day
  date.setDate(date.getDate() + 1);

  // Format back into the custom format
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, '0');
  let day = String(date.getDate()).padStart(2, '0');
  let hours = String(date.getHours()).padStart(2, '0');
  let minutes = String(date.getMinutes()).padStart(2, '0');
  let seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}-00`;
}
// convert YYYY-MM-DD-HH-MM-SS-SS into YYYY-MM-DD-HH-MM-SS-SS califronia then into YYYY-MM-DDTHH:mm:ss.sssZ uct
export function parseDate(dateString, timezone) {//timezone = 'America/Los_Angeles'
  const formattedDate = dateString.replace(/-/g, '').slice(0, -2); // "20240103000000"

  // Parse the custom date format
  const date = moment.tz(formattedDate, "YYYYMMDDHHmmss", timezone);

  // Format the date in the desired output
  const losAngelesDate = date.format('ddd MMM DD YYYY HH:mm:ss [GMT]Z (zz)');
  // console.log(new Date(losAngelesDate))
  // Note: months are 0-based in JavaScript Date
  return new Date(losAngelesDate);
}

// convert YYYY-MM-DD-HH-MM-SS-SS into YYYY-MM-DD-HH-MM-SS-SS califronia then into YYYY-MM-DDTHH:mm:ss.sssZ uct

export function parseDateUTC(dateString, timezone) {//timezone = 'America/Los_Angeles'
  const formattedDate = dateString.replace(/-/g, '').slice(0, -2); // "20240103000000"
  const date = moment.tz(formattedDate, "YYYYMMDDHHmmss", "UTC");

  return date.tz(timezone).format("M/D/YY HH:mm");
}

// convert YYYY-MM-DDTHH:mm:ss.sssZ into YYYY-MM-DD-HH-MM-SS-SS
export function convertDateFormat(dateString) {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(date.getUTCMilliseconds()).padStart(2, '0');
  // console.log("dateStringdateString")
  // console.log(dateString)
  // console.log(`${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${milliseconds}`)
  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${milliseconds}`;
}
