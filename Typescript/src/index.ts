import moment from "moment";
import { Vehicle } from "./Vehicles";
import {
  getEasterDates,
  isAllHallowsEve,
  isMidsummer,
  timeIsBetween,
} from "./dateHelpers";
import { FeeGroup } from "./types";

// Constants
const MAX_FEE_PER_VEHICLE = 60;

// Days when fees do not apply, these holidays are always the same date every year,
// and can therefore be hardcoded
const holidays = [
  "1/1", // New years day
  "6/1", // Trettondagen
  "1/5", // First of may (workers day)
  "6/6", // National day of Sweden
  "24/12", // Christmas eve
  "25/12", // Christmas day
  "26/12", // Boxing day
  "31/12", // New years eve
];

export const getTollFee = (vehicle: Vehicle, dates: number[]): number => {
  // Make sure the dats are sorted so that the oldest date is first,
  // otherwise the later logic may not work properly
  dates.sort((a, b) => a - b);

  // The following is an algorithm to group together dates that belong together
  // By belonging together I mean dates that are within 1 hour of each other
  const groups: FeeGroup[] = [];
  let currentGroup: FeeGroup = {
    dates: [],
  };

  dates.forEach((date) => {
    if (currentGroup.dates.length === 0) {
      currentGroup.dates.push(date);
    } else {
      const timeDifference = date - currentGroup.dates[0];
      if (timeDifference <= 1000 * 60 * 60) {
        currentGroup.dates.push(date);
      } else {
        groups.push(currentGroup);
        currentGroup = {
          dates: [date],
        };
      }
    }
  });

  if (currentGroup.dates.length > 0) {
    groups.push(currentGroup);
  }

  groups.forEach((group) => {
    // Generate readable dates which are easier to read for debugging
    group.readableDates = group.dates.map((d: number) =>
      moment(d).format("DD/MM/YYYY - HH:mm")
    );
    // Generate fees for each date in the group
    group.fees = group.dates.map((d: number) =>
      getFeeForDateAndVehicle(d, vehicle)
    );
    // Get the highest fee in the group
    group.highestFee = group.fees.sort((a, b) => b - a)[0];
  });
  console.log(groups);

  let totalFee: number = groups.reduce(
    (total, group) => (total += group.highestFee ?? 0),
    0
  );

  // TODO:
  // After finishing writing this I realized that with this logic, the max total fee will never be more than 60
  // But 60 kr is the max fee for ONE day. So if the dates parameters contains timestamps that span over
  // several days this algorithm would need to be changed a bit, so that it also groups based on day,
  // and the calculates the totalFee for each day, which at maximum would be 60 * <number of days>
  if (totalFee > MAX_FEE_PER_VEHICLE) {
    totalFee = MAX_FEE_PER_VEHICLE;
  }
  console.log("totalFee", totalFee);

  return totalFee;
};

export const getFeeForDateAndVehicle = (
  date: number,
  vehicle: Vehicle
): number => {
  if (isTollFreeDate(date) || isTollFreeVehicle(vehicle)) return 0;

  let hour = Number(moment(date).format("HH"));
  let minute = Number(moment(date).format("mm"));
  let time = moment(`${hour}:${minute}`, "HH:mm");

  if (timeIsBetween(time, "06:00", "06:29")) return 8;
  if (timeIsBetween(time, "06:30", "06:59")) return 13;
  if (timeIsBetween(time, "07:00", "07:59")) return 18;
  if (timeIsBetween(time, "08:00", "08:29")) return 13;
  if (timeIsBetween(time, "08:30", "14:59")) return 8;
  if (timeIsBetween(time, "15:00", "15:29")) return 13;
  if (timeIsBetween(time, "15:30", "16:59")) return 18;
  if (timeIsBetween(time, "17:00", "17:59")) return 13;
  if (timeIsBetween(time, "18:00", "18:29")) return 8;

  return 0;
  // So between 18:30 and 05:59 the fee is 0. I'm assuming this is what we want?
  // Othwerwise we should add something like:
  // if (timeIsBetween(time, "18:30", "05:59")) return 13.37;
};

const isTollFreeDate = (date: number): boolean => {
  let year = Number(moment(date).format("YYYY"));
  let month = Number(moment(date).format("MM"));
  let day = Number(moment(date).format("DD"));
  let dayOfWeek = moment(date).format("dddd"); // eg "Monday", "Tuesday" etc

  if (dayOfWeek === "Saturday" || dayOfWeek === "Sunday") return true;
  // The following is to check for hardcoded holidays that occur
  // on the same date every year
  if (holidays.includes(`${day}/${month}`)) return true;
  // Is it easter holiday?
  const easterDates = getEasterDates(year);
  if (
    moment(date).format("DD-MM-YYYY") === easterDates.easterEve ||
    moment(date).format("DD-MM-YYYY") === easterDates.easterDay ||
    moment(date).format("DD-MM-YYYY") === easterDates.goodFriday ||
    moment(date).format("DD-MM-YYYY") === easterDates.easterMonday ||
    moment(date).format("DD-MM-YYYY") === easterDates.ascensionDay
  ) {
    return true;
  }
  if (isAllHallowsEve(date)) return true;
  if (isMidsummer(date)) return true;

  // Else return false
  return false;
};

const isTollFreeVehicle = (vehicle: Vehicle): boolean => {
  if (
    vehicle.type === "Motorbike" ||
    vehicle.type === "Tractor" ||
    vehicle.type === "Emergency" ||
    vehicle.type === "Diplomat" ||
    vehicle.type === "Foreign" ||
    vehicle.type === "Military"
  ) {
    return true;
  } else {
    return false;
  }
};

const run = (): void => {
  // On init will run a hardcoded test case
  getTollFee({ type: "Car" }, [
    Number(moment("10/3/2025 07:59", "DD/MM/YYYY HH:mm").format("x")),
    Number(moment("10/3/2025 08:15", "DD/MM/YYYY HH:mm").format("x")),
    Number(moment("10/3/2025 08:45", "DD/MM/YYYY HH:mm").format("x")),
    Number(moment("10/3/2025 08:59", "DD/MM/YYYY HH:mm").format("x")),
    Number(moment("10/3/2025 10:10", "DD/MM/YYYY HH:mm").format("x")),
    Number(moment("10/3/2025 10:20", "DD/MM/YYYY HH:mm").format("x")),
    Number(moment("10/3/2025 10:30", "DD/MM/YYYY HH:mm").format("x")),
  ]);
};

run();
