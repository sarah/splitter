const Promise = require("bluebird");
const Splitter = artifacts.require("./Splitter.sol");


contract("Splitter", function(accounts){
    let splitter, funder, payee1, payee2;

    before("should prepare accounts", function(){
        funder = accounts[0];
        payee1 = accounts[1];
        payee2 = accounts[2];
        Promise.promisifyAll(web3.eth, {suffix: "Promise"});
    });

    //beforeEach("should deploy a new Splitter", function(){
        //console.log('hello in beforeEach');
        //return Splitter.new()
            //.then(created => {

                //splitter = created;
                //console.log('splitter found');
            //}
            //);
    //});

    //it("should use the splitter instance in beforeEach?", function(){
        //// This test with the beforeEach throws this error
        //// Error: VM Exception while processing transaction: invalid JUMP at c086c902c2be7fc1c539a454176b35d9b221bead267605d9a4c6b418dc279e2a/a1376e8917b3cb8ddc03187b1a7f7940a1103503:68

        ////console.log('hello', splitter);
        //return splitter.depositFunds({from:funder,value:web3.toWei(4,"ether")})
            //.then(txo => {
                //console.log('hi txo');
            //}
        //);
        //console.log('just deposited funds maybe');

        ////return splitter.depositFunds({from:funder,value:web3.toWei(4,"ether")})
            ////.then(txObj => {
                ////console.log('hello!', txObj);
            ////});
    //});

    it("should equally split input between payees in balances", function(){
        return Splitter.deployed()
            .then(_instance => {
                splitter = _instance;
                return splitter.depositFunds({from:funder,value:web3.toWei(4,"ether")})
            })
            .then(txObj => {
                console.log('txHash', txObj);
                return Promise.all([
                    splitter.balances(payee1),
                    splitter.balances(payee2),
                  ]
                )
            })
            .then(results => {
                assert.strictEqual(results[0].toString(10), web3.toWei(2, "ether"));
                assert.strictEqual(results[1].toString(10), web3.toWei(2, "ether"));
            })
    });

    it("should assign the remainder to the funder", function(){
        return Splitter.deployed()
            .then(_instance => {
                splitter = _instance;
                return splitter.depositFunds({from:funder,value:5})
            })
            .then(_txObj => {
                console.log('txHash', _txObj);
                return Promise.all([
                    splitter.balances(payee1),
                    splitter.balances(payee2),
                    splitter.balances(funder),
                  ]
                )
            })
            .then(results => {
                assert.strictEqual(results[0].toString(10), '2');
                assert.strictEqual(results[1].toString(10), '2' );
                assert.strictEqual(results[2].toString(10), '1' );
            })
    });


    it("should send the balance to the payee, minus gas", function(){
        return Splitter.deployed()
            .then(_instance => {
                splitter = _instance;
                return splitter.depositFunds({from:funder,value:4})
            })
            .then(_txObj => {
                return splitter.withdrawFunds(payee1);
            })
            .then(txObj => {
                return web3.eth.getBalancePromise(payee1);
            })
            .then(balance => {
                console.log("balance", balance);
                console.log("balance", balance.toString(10));
            })
    });


});



















