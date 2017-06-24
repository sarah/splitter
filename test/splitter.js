const Promise = require("bluebird");
const Splitter = artifacts.require("./Splitter.sol");


function etherInWei(etherInt){
    return web3.toWei(etherInt, "ether");
}

function weiInEther(weiInt){
    return web3.fromWei(weiInt);
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
                assert.strictEqual(results[0].toString(10), "4");
                assert.strictEqual(results[1].toString(10), "4");
                assert.strictEqual(results[2].toString(10), "1");
            })
    });


    it("should send the balance to the payee", function(){
        let payeeInitialBalance, payeeNewBalance, weiOwedPayee;

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
                weiOwedPayee = _initialBalances[0];
                payeeInitialBalance = _initialBalances[1];

                return splitter.withdrawFunds(payee1);
            })
            .then(_txObj => {
                return Promise.all([
                    splitter.balances(payee1),
                    web3.eth.getBalancePromise(payee1)
                ])
            })
            .then(_finalBalances => {
                var currentWeiOwed = _finalBalances[0];
                payeeNewBalance = _finalBalances[1];
                assert.strictEqual(currentWeiOwed.toString("10"), "0");
                assert.strictEqual(payeeInitialBalance.plus(weiOwedPayee).toString("10"), payeeNewBalance.toString("10"));
            })
    });
});



















