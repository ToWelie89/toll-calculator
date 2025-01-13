import moment from "moment";
import { getFeeForDateAndVehicle, getTollFee } from "../src/index";
import { Vehicle } from "../src/Vehicles";

const { test, expect } = require("@jest/globals");
test("getFeeForDateAndVehicle 10/3/2025 (monday) at 14:23", () => {
  expect(
    getFeeForDateAndVehicle(
      Number(moment("10/3/2025 14:23", "DD/MM/YYYY HH:mm").format("x")),
      { type: "Car" }
    )
  ).toBe(8);
});
test("getFeeForDateAndVehicle 9/3/2025 (sunday) at 14:23", () => {
  expect(
    getFeeForDateAndVehicle(
      Number(moment("9/3/2025 14:23", "DD/MM/YYYY HH:mm").format("x")),
      { type: "Car" }
    )
  ).toBe(0); // should return 0 because it's a sunday
});
test("getFeeForDateAndVehicle 10/3/2025 (monday) at 15:44", () => {
  expect(
    getFeeForDateAndVehicle(
      Number(moment("10/3/2025 15:44", "DD/MM/YYYY HH:mm").format("x")),
      { type: "Car" }
    )
  ).toBe(18); // 18 because it's between an interval that is rush hour
});
test("getFeeForDateAndVehicle 10/3/2025 (monday) at 15:44 - with Diplomat vehicle", () => {
  expect(
    getFeeForDateAndVehicle(
      Number(moment("10/3/2025 15:44", "DD/MM/YYYY HH:mm").format("x")),
      { type: "Diplomat" }
    )
  ).toBe(0); // should be 0 regardless of date and time because of the vehicle type
});
test("getFeeForDateAndVehicle 24/12/2025 at 13:22", () => {
  expect(
    getFeeForDateAndVehicle(
      Number(moment("24/12/2025 13:22", "DD/MM/YYYY HH:mm").format("x")),
      { type: "Car" }
    )
  ).toBe(0); // should be 0 because it's Christmas Eve!
});

test("getTollFee test case 1", () => {
  expect(
    /*
        Same scenario as I described in my comment in TollCalculator.cs,
        testing my equivalent implementation in TypeScript
    */
    getTollFee({ type: "Car" }, [
      Number(moment("10/3/2025 07:59", "DD/MM/YYYY HH:mm").format("x")), // Note: 10/3/2025 is a monday, and not a holiday
      Number(moment("10/3/2025 08:15", "DD/MM/YYYY HH:mm").format("x")),
      Number(moment("10/3/2025 08:45", "DD/MM/YYYY HH:mm").format("x")),
      Number(moment("10/3/2025 08:59", "DD/MM/YYYY HH:mm").format("x")),
      Number(moment("10/3/2025 10:10", "DD/MM/YYYY HH:mm").format("x")),
      Number(moment("10/3/2025 10:20", "DD/MM/YYYY HH:mm").format("x")),
      Number(moment("10/3/2025 10:30", "DD/MM/YYYY HH:mm").format("x")),
    ])
  ).toBe(26);
});

test("getTollFee test case 2", () => {
  expect(
    getTollFee({ type: "Car" }, [
      // 06:10 and 06:50 are both within 1 hour of each other, these should be one group
      Number(moment("10/3/2025 06:10", "DD/MM/YYYY HH:mm").format("x")), // Should cost 8 kr
      Number(moment("10/3/2025 06:50", "DD/MM/YYYY HH:mm").format("x")), // Should cost 13 kr
      // 09:45 and 10:33 are both within 1 hour of each other, these should be one group
      Number(moment("10/3/2025 09:45", "DD/MM/YYYY HH:mm").format("x")), // Should cost 8 kr
      Number(moment("10/3/2025 10:33", "DD/MM/YYYY HH:mm").format("x")), // Should cost 8 kr
      // 14:10, 14:38 and 14:59 are both within 1 hour of each other, these should be one group
      Number(moment("10/3/2025 14:10", "DD/MM/YYYY HH:mm").format("x")), // Should cost 8 kr
      Number(moment("10/3/2025 14:38", "DD/MM/YYYY HH:mm").format("x")), // Should cost 8 kr
      Number(moment("10/3/2025 14:59", "DD/MM/YYYY HH:mm").format("x")), // Should cost 8 kr
      // 18:10 and 19:05 are both within 1 hour of each other, these should be one group
      Number(moment("10/3/2025 18:10", "DD/MM/YYYY HH:mm").format("x")), // Should cost 8 kr
      Number(moment("10/3/2025 19:05", "DD/MM/YYYY HH:mm").format("x")), // Should cost 0 kr
    ])
  ).toBe(37); // Total should be 13 + 8 + 8 + 8 = 37
});

// TODO: more test cases would be good to add here
// Also tests with timestamps that cover holidays, weekends, different vehicle types etc etc etc