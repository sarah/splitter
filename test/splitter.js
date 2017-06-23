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
        //return Splitter.new()
            //.then(created => splitter = created);
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
});
