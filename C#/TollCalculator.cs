using System;
using System.Globalization;
using TollFeeCalculator;

public class TollCalculator
{

    /**
     * Calculate the total toll fee for one day
     *
     * @param vehicle - the vehicle
     * @param dates   - date and time of all passes on one day
     * @return - the total toll fee for that day
     */

    public int GetTollFee(Vehicle vehicle, DateTime[] dates)
    {
        DateTime intervalStart = dates[0];
        int totalFee = 0;
        foreach (DateTime date in dates)
        {
            // Confusing that this other method has the same name ("GetTollFee"). It almost looks like
            // this is a recursive call, but it's not. Because they are two different methods
            // since they have different parameter types. But it's confusing, so it would be better
            // to rename this other method
            int nextFee = GetTollFee(date, vehicle);
            int tempFee = GetTollFee(intervalStart, vehicle);

            // Diff could be negative is date comes before intervalStart, ie the list isn't
            // sorted correctly initially
            long diffInMillies = date.Millisecond - intervalStart.Millisecond;
            long minutes = diffInMillies/1000/60;

            // The following logic means that if the time difference between two dates is less than 60 minutes,
            // the fee will be the highest of the two fees. Otherwise we just add the "nextFee" to the totalFee.
            // But the "minutes" variable will always be the difference in minutes between the current fee and the
            // very first fee in the list. What if there are like 9 fees, in the list? Something like this
            //          7:59, 8:15, 8:45, 8:59, 10:10, 10:20, 10:30
            //
            // The first 4 fees are all within 60 minutes of each other (7:59 - 8:59), so here only one of these
            // fees should be added to the total, and it should be the highest one, which is 18 kr (for interval 7:00 - 7:59)
            //
            // After that there is a 1 hour and 11 minutes gap to the next fee (10:10) so here the 60 minuter "timer"
            // should be reset. Within 10:10 and 11:10 there are 3 more fees, so here it should add the highest fee
            // of these 3, which is 8 (all 3 cost 8 kr)
            //
            // So the total for the day should be 18 + 8 kr = 26 kr (if I understand the requirements correctly)
            //
            // I wrote a different algorithm for this in my Typescript implementation, which I think should be more correct
            // 
            // I also wrote a unit test for this exact scenario, with the same timestamps, to make sure that my implementation
            // returns the correct totalFee, given my understanding of the requirements, see index.test.ts
            if (minutes <= 60)
            {
                if (totalFee > 0) totalFee -= tempFee;
                if (nextFee >= tempFee) tempFee = nextFee;
                totalFee += tempFee;
            }
            else
            {
                totalFee += nextFee;
            }
        }
        if (totalFee > 60) totalFee = 60;
        return totalFee;
    }

    private bool IsTollFreeVehicle(Vehicle vehicle)
    {
        if (vehicle == null) return false;
        String vehicleType = vehicle.GetVehicleType();
        return vehicleType.Equals(TollFreeVehicles.Motorbike.ToString()) ||
               vehicleType.Equals(TollFreeVehicles.Tractor.ToString()) ||
               vehicleType.Equals(TollFreeVehicles.Emergency.ToString()) ||
               vehicleType.Equals(TollFreeVehicles.Diplomat.ToString()) ||
               vehicleType.Equals(TollFreeVehicles.Foreign.ToString()) ||
               vehicleType.Equals(TollFreeVehicles.Military.ToString());
    }

    public int GetTollFee(DateTime date, Vehicle vehicle)
    {
        if (IsTollFreeDate(date) || IsTollFreeVehicle(vehicle)) return 0;

        int hour = date.Hour;
        int minute = date.Minute;

        if (hour == 6 && minute >= 0 && minute <= 29) return 8;
        else if (hour == 6 && minute >= 30 && minute <= 59) return 13;
        else if (hour == 7 && minute >= 0 && minute <= 59) return 18;
        else if (hour == 8 && minute >= 0 && minute <= 29) return 13;
        /*
            This is some strange logic. I am assuming here that the idea was
            that between 8:30 and 14:59, the fee should be 8 kr...
            But because minute has to be between 30 and 59, it means for instance
            for every first half hour of every hour between 8-14, the fee will not be 8

            Like for instance if the time is 8:15, whis condition will not be met
        */
        else if (hour >= 8 && hour <= 14 && minute >= 30 && minute <= 59) return 8;
        else if (hour == 15 && minute >= 0 && minute <= 29) return 13;
        /*
            The following if-conditions are not that easy to follow. It would be better
            to write a function like isBetween(start, end) where both start and end
            are times (HH:MM), and use that function to check if the time is between
            a given interval. It would make the code more readable and easier to follow.

            Compare with my equivalent solution in the typescript file, which I think is
            much easier to follow and understand.
        */
        else if (hour == 15 && minute >= 0 || hour == 16 && minute <= 59) return 18;
        else if (hour == 17 && minute >= 0 && minute <= 59) return 13;
        else if (hour == 18 && minute >= 0 && minute <= 29) return 8;
        else return 0;
    }

    private Boolean IsTollFreeDate(DateTime date)
    {
        int year = date.Year;
        int month = date.Month;
        int day = date.Day;

        // Where is DayOfWeek defined??
        if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday) return true;

        // Why check only for 2013 specifically? Is the code outdated or hardcoded to only work for the year it was written?
        // It would be better to write an algorithm that works EVERY year and takes the current year into account, so calculate
        // the dates for easter, midsummer etc. every year and check against that. Current implementation is not future-proof.
        if (year == 2013)
        {
            // The following logic assumes that some holidays are the same exact date every year
            // This may be true for new years eve, christmas eve etc etc. But not true for easter, midsummer etc...
            if (month == 1 && day == 1 || // seems to be missing trettondagen? It's a holiday in Sweden according to https://www.ifmetall.se/medlem/jobbet-och-jag/roda-dagar-2025/ 
                // Easter dates cannot be hardcoded because they change every year. These dates may be true for 2013, but it would be
                // better to calculate the dates for easter every year and check against that.
                month == 3 && (day == 28 || day == 29) || 
                month == 4 && (day == 1 || day == 30) ||
                month == 5 && (day == 1 || day == 8 || day == 9) ||
                // Likewise days for midsummers eve and day change every year
                month == 6 && (day == 5 || day == 6 || day == 21) ||
                // This assumes ALL days of July (month 7) are toll-free. This is certainly not true based on the holidays in Sweden,
                // so this would only be correct if this was part of the requirements, that all days in july are toll-free, which is not mentioned.
                month == 7 ||
                month == 11 && day == 1 ||
                month == 12 && (day == 24 || day == 25 || day == 26 || day == 31))
            {
                return true;
            }
        }
        return false;
    }

    private enum TollFreeVehicles
    {
        Motorbike = 0,
        Tractor = 1,
        Emergency = 2,
        Diplomat = 3,
        Foreign = 4,
        Military = 5
    }
}