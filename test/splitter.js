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

    beforeEach("clear out payees balances", function(){
        return Splitter.deployed()
            .then(_instance => {
                splitter = _instance;
                return Promise.all([
                    splitter.withdrawFunds(payee1),
                    splitter.withdrawFunds(payee2)
                    ]
                )
            })
            .then(_txo => {})
            .catch(_err => {
                // no-op
            })
    })

    it("when sent by funder, should equally split input between payees in balances", function(){
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

    it("should add to existing balance if payee hasn't collected between deposits", function(){
        return Splitter.deployed()
            .then(_instance => {
                splitter = _instance;
                return Promise.all([
                        splitter.depositFunds({from:funder, value: etherInWei(4)}),
                        splitter.depositFunds({from:funder, value: etherInWei(4)}),
                    ]
                )
            })
            .then(_tx_results => {
                return Promise.all([
                    splitter.balances(payee1),
                    splitter.balances(payee2),
                    ]
                )
            }).then(balances => {
                assert.strictEqual(balances[0].toString(10), etherInWei(4));
                assert.strictEqual(balances[1].toString(10), etherInWei(4));
            })
    });

    it("should assign the remainder to the funder, and add to funders existing funds if they exist", function(){
        return Splitter.deployed()
            .then(_instance => {
                splitter = _instance;
                return Promise.all([
                    splitter.depositFunds({from:funder,value:9}), // just 9 wei
                    splitter.depositFunds({from:funder,value:1})  // just 1 wei
                    ]
                )
            })
            .then(_txObjs => {
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
                assert.strictEqual(results[2].toString(10), "2"); // remainder 2 wei
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

    /* Not sure how to test that errors are thrown. 
     * When I run this code, which throws an error b/c the funds come from payee1
     * the message I get is: 
     * Error: VM Exception while processing transaction: invalid JUMP at c086c902c2be7fc1c539a454176b35d9b221bead267605d9a4c6b418dc279e2a/6a4019f21672b08bcaf3439f9026ede432dad399:68
     * so I've commented it out but it's something I need to learn
     
    it("when not initiated by funder, no balances change", function(){
        let payee1InitialBalance, payee2InitialBalance, funderInitialBalance;

        return Splitter.deployed()
            .then(_instance => {
                splitter = _instance;
                return splitter.depositFunds({from:payee1,value:etherInWei(4)})
            })
            .then(_txObj => {
                return Promise.all([
                    web3.eth.getBalancePromise(payee1),
                    web3.eth.getBalancePromise(payee2),
                    web3.eth.getBalancePromise(funder)
                ])
            })
            .then(_initialBalances => {
                payee1InitialBalance = _initialBalances[0];
                payee2InitialBalance = _initialBalances[1];
                funderInitialBalance = _initialBalances[2];

                return splitter.withdrawFunds(payee2);
            })
            .then(_txObj => {
                return Promise.all([
                    web3.eth.getBalancePromise(payee1),
                    web3.eth.getBalancePromise(payee2),
                    web3.eth.getBalancePromise(funder)
                ])
            })
            .then(_finalBalances => {
                var payee1NewBalance = _finalBalances[0];
                var payee2NewBalance = _finalBalances[1];
                var funderNewBalance = _finalBalances[2];
                assert.strictEqual(payee1InitialBalance.toString("10"), payee1NewBalance.toString("10"));
                assert.strictEqual(payee2InitialBalance.toString("10"), payee2NewBalance.toString("10"));
                assert.strictEqual(funderInitialBalance.toString("10"), funderBalance.toString("10"));
            })
    });
    */
});



















