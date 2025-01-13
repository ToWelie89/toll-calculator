# Prerequisites

Node and npm (I use v18.20.5 and npm 10.8.2)

# Get started

* Run `npm install`

# Execute

Run `npm start`

This will at the moment just run a hardcoded testcase defined in the `run()` function. Check the console log for output.

The main function of index.ts is `getTollFee()` which will take as parameters one vehicle and the timestamps (as UNIX timestamps) as an array, and then calculate the total fee.

The current implementation assumes that `getTollFee()` will only be called with timestamps from the same day. If however the list of timestamps will be over the course of several days, then the logic would need to be amended, because at the moment getTollFee will never return more than 60 kr, which is the max amount to pay for fees for ONE day.

# Test

Run `npm test`

This will run my defined Jest unit tests that you find in the test-folder.

`dateHelpers.test.ts` tests certain helper functions I wrote

`index.test.ts` tests the core algorithm