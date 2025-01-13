import { getEasterDates } from "../src/dateHelpers";

const { test, expect } = require('@jest/globals');

// Compare with https://kalender.se/helgdagar/2025
test("getEasterDates for 2025", () => {
  const easterDates = getEasterDates(2025);
  expect(easterDates.easterEve).toBe("19-04-2025");
  expect(easterDates.easterDay).toBe("20-04-2025");
  expect(easterDates.easterMonday).toBe("21-04-2025");
  expect(easterDates.goodFriday).toBe("18-04-2025");
  expect(easterDates.ascensionDay).toBe("29-05-2025");
});

// Compare with https://kalender.se/helgdagar/2020
test("getEasterDates for 2020", () => {
  const easterDates = getEasterDates(2020);
  expect(easterDates.easterEve).toBe("11-04-2020");
  expect(easterDates.easterDay).toBe("12-04-2020");
  expect(easterDates.easterMonday).toBe("13-04-2020");
  expect(easterDates.goodFriday).toBe("10-04-2020");
  expect(easterDates.ascensionDay).toBe("21-05-2020");
});
