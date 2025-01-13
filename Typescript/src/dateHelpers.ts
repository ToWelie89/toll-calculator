import moment from "moment";

export const timeIsBetween = (
  timeToCheck: moment.Moment,
  startTime: string,
  endTime: string
): boolean => {
  return timeToCheck.isBetween(
    moment(startTime, "HH:mm"),
    moment(endTime, "HH:mm"),
    null,
    "[]"
  );
};

export const getEasterDates = (
  year: number
): {
  easterEve: string;
  easterDay: string;
  goodFriday: string;
  easterMonday: string;
  ascensionDay: string;
} => {
  // Calculate easter day based on this algorithm using the Gregorian calendar
  // To be clear I had no idea how to calculate this, I found this algorithm on the internet
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);

  // Easter day / Påskdagen
  const easterSunday = new Date(year, month - 1, day);

  // Easter eve / Påskafton
  const easterEve = new Date(easterSunday);
  easterEve.setDate(easterSunday.getDate() - 1);

  // Good friday / Långfredag
  const goodFriday = new Date(easterSunday);
  goodFriday.setDate(easterSunday.getDate() - 2);

  // Easter Monday / Annandag påsk
  const easterMonday = new Date(easterSunday);
  easterMonday.setDate(easterSunday.getDate() + 1);

  // Ascension day / Kristi himmeelsfärdsdag
  const ascensionDay = new Date(easterSunday);
  ascensionDay.setDate(easterSunday.getDate() + 39);

  return {
    easterEve: moment(easterEve).format("DD-MM-YYYY"),
    easterDay: moment(easterSunday).format("DD-MM-YYYY"),
    goodFriday: moment(goodFriday).format("DD-MM-YYYY"),
    easterMonday: moment(easterMonday).format("DD-MM-YYYY"),
    ascensionDay: moment(ascensionDay).format("DD-MM-YYYY"),
  };
};

export const isAllHallowsEve = (date: number): boolean => {
  // TODO: Implement this function so that the function will take the given year
  // into account and from that determine the exact date for All Hallows Eve
  return false;
};

export const isMidsummer = (date: number): boolean => {
  // TODO: Implement this function so that the function will take the given year
  // into account and from that determine the exact dates for Midsummers eve and day
  return false;
};