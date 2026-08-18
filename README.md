# Cash Register

## Sam Persinger's Implementation

### Getting Started

```bash
# Install dependencies
yarn install

# Start the dev server
yarn dev
```
The app will be available at http://localhost:5173.

### How It Works
Manual mode: Enter an amount owed and amount paid, click Calculate.
File upload: Upload a .txt or .csv file with one transaction per line (owed,paid), e.g.:
```
2.12,3.00
1.97,2.00
3.33,5.00
```
Each line produces a change breakdown. If the owed amount (in cents) is divisible by the random divisor (defaults to 3), change denominations are randomized while still totaling correctly.
Config upload: Upload a JSON config to change the currency or random divisor:
```json
{
  "currency": "US",
  "randomDivisor": 3
}
```
Supported Currencies
- US
- GB
- EUR
Adding a new currency type is as simple as editing the currentDenominations.json file in src/currencyDenominations.json. The software will automatically detect and use the updated denominations if the country code is added to the config JSON, or matches the browsers country code for the current location.

Currency is auto-detected from browser geolocation when permitted, falling back to the default config file if not. Supported denominations are defined in src/currencyDenominations.json.
Project Structure
src/
├── ChangeProcessor.ts          Core business logic (framework-agnostic, allowing for refactoring and reuse in different applications)
├── App.tsx                     Root React component
├── main.tsx                    React entry point
├── ResultItem.tsx              Single result line renderer
├── currencyDenominations.json  Denomination data per currency
├── components/
│   ├── ConfigLoader.tsx        Config JSON file upload UI
│   ├── FileProcessor.tsx       Flat-file upload UI
│   ├── ManualCalculator.tsx    Manual owed/paid input UI
│   └── ResultsPanel.tsx        Results display + download
├── helpers/
│   ├── currencyForCountry.ts   Country code → currency mapping
│   └── supportedCurrencies.ts  Set of valid currency keys
├── hooks/
│   └── useGeolocation.ts       Browser geolocation + reverse geocoding
├── types/
│   ├── currency.ts             Denomination type + exported map
│   └── locationData.ts         LocationData interface
├── scripts/
│   └── main.ts                 Standalone CLI demo (no React)
└── __tests__/
    ├── ChangeProcessor.test.ts Unit tests for core logic
    ├── App.test.tsx            Integration tests
    └── ResultItem.test.tsx     Component tests
Tech Stack
- TypeScript, React 19, Vite 8, Vitest, React Testing Library

---

## The Problem
Creative Cash Draw Solutions is a client who wants to provide something different for the cashiers who use their system. The function of the application is to tell the cashier how much change is owed, and what denominations should be used. In most cases the app should return the minimum amount of physical change, but the client would like to add a twist. If the "owed" amount is divisible by 3, the app should randomly generate the change denominations (but the math still needs to be right :))

Please write a program which accomplishes the clients goals. The program should:

1. Accept a flat file as input
	1. Each line will contain the amount owed and the amount paid separated by a comma (for example: 2.13,3.00)
	2. Expect that there will be multiple lines
2. Output the change the cashier should return to the customer
	1. The return string should look like: 1 dollar,2 quarters,1 nickel, etc ...
	2. Each new line in the input file should be a new line in the output file

## Sample Input
2.12,3.00

1.97,2.00

3.33,5.00

## Sample Output
3 quarters,1 dime,3 pennies

3 pennies

1 dollar,1 quarter,6 nickels,12 pennies

*Remember the last one is random

## The Fine Print
Please use whatever technology and techniques you feel are applicable to solve the problem. We suggest that you approach this exercise as if this code was part of a larger system. The end result should be representative of your abilities and style.

Please fork this repository. When you have completed your solution, please issue a pull request to notify us that you are ready.

Have fun.

## Things To Consider
Here are a couple of thoughts about the domain that could influence your response:

* What might happen if the client needs to change the random divisor?
* What might happen if the client needs to add another special case (like the random twist)?
* What might happen if sales closes a new client in France?
