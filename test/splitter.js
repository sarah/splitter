const Promise = require("bluebird");
const Splitter = artifacts.require("./Splitter.sol");


function etherInWei(int){
    return web3.toWei(int, "ether");
}

contract("Splitter", function(accounts){
    let splitter, funder, payee1, payee2;

    before("should prepare accounts", function(){
        funder = accounts[0];
        payee1 = accounts[1];
        payee2 = accounts[2];
        Promise.promisifyAll(web3.eth, {suffix: "Promise"});
    });

    it("should equally split input between payees in balances", function(){
        return Splitter.deployed()
            .then(_instance => {
                splitter = _instance;
                return splitter.depositFunds({from:funder,value:etherInWei(4)})
            })
            .then(txObj => {
                return Promise.all([
                    splitter.balances(payee1),
                    splitter.balances(payee2),
                  ]
                )
            })
            .then(results => {
                assert.strictEqual(results[0].toString(10), etherInWei(2));
                assert.strictEqual(results[1].toString(10), etherInWei(2));
            })
    });

    it("should assign the remainder to the funder", function(){
        return Splitter.deployed()
            .then(_instance => {
                splitter = _instance;
                return splitter.depositFunds({from:funder,value:9})
            })
            .then(_txObj => {
                return Promise.all([
                    splitter.balances(payee1),
                    splitter.balances(payee2),
                    splitter.balances(funder),
                  ]
                )
            })
            .then(results => {
                console.log('results', results);
                assert.strictEqual(results[0].toString(10), "4");
                assert.strictEqual(results[1].toString(10), "4");
                assert.strictEqual(results[2].toString(10), "1");
            })
    });


    it("should send the balance to the payee, minus gas", function(){
        return Splitter.deployed()
            .then(_instance => {
                splitter = _instance;
                return splitter.depositFunds({from:funder,value:etherInWei(4)})
            })
            .then(_txObj => {
                return Promise.all([
                    splitter.balances(payee1),
                    web3.eth.getBalancePromise(payee1)
                ])
            })
            .then(_initialBalances => {
                console.log('_initialBalances ', _initialBalances);
                var weiOwed = _initialBalances[0];
                var weiCurrent = _initialBalances[1];
                var weiCurrentToWei = web3.toWei(_initialBalances[1]);
                console.log("owed after withdrawing", weiOwed);
                console.log("current after withdrawing", weiCurrent);

                return splitter.withdrawFunds(payee1);
            })
            .then(_txObj => {
                //console.log('_txObj', _txObj);
                return Promise.all([
                    splitter.balances(payee1),
                    web3.eth.getBalancePromise(payee1)
                ])
            })
            .then(_finalBalances => {
                console.log("balance", _finalBalances);
                var weiOwed = _finalBalances[0];
                var weiCurrent = _finalBalances[1];
                console.log("owed after withdrawing", weiOwed);
                console.log("current after withdrawing", weiCurrent);
            })
    });


});



















