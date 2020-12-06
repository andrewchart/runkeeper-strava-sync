/**
 * date-to-filename.js
 *
 * Converts a UTC date to an alphanumeric string to be used as a filename
 * @param  {String} date Date in UTC (ISO-8601) format
 * @return {String}      Date as an alphanumeric string
 */
function dateToFilename(date) {
  const regex = /-|:|Z/gi;
  return date.replace(regex,"").replace("T","-").trim();
}

module.exports = dateToFilename;
