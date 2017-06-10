# Sarah Splitter First Pass

## Usage
Right now it depends on hard-coded addresses on my Geth blockchain.

## TODO
* Make it take Bob & Carol addresses
* Make "Alice" be the coinbase instead of a hard-coded address
* Error handle

## Building and the frontend
1. First run `truffle compile`, then run `truffle migrate` to deploy the contracts onto your network of choice (default "development").
1. Then run `npm run dev` to build the app and serve it on http://localhost:8080

