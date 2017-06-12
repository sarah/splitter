const Web3 = require('web3');
const Promise = require('bluebird');
var Splitter = artifacts.require("./Splitter.sol");

Promise.promisifyAll(web3.eth, { suffix: "Promise" });

contract("Splitter", accounts => {
    let acc0 = accounts[0];
    let acc1 = accounts[1];
    let acc2 = accounts[2];
    let amt = 1000;
    let half = amt/2;
    var acc0_starting_balance, acc1_starting_balance, acc2_starting_balance;
    var acc0_ending_balance, acc1_ending_balance, acc2_ending_balance;
    var splitter_instance;


    it('splits between b&c when money in from a', function(){
        return Splitter.deployed()
            .then(function(instance){
                splitter_instance = instance;
                return getBalance(acc0);
            })
            .then(function(_balance){
                acc0_starting_balance = _balance;
                return getBalance(acc1);
            })
            .then(function(_balance){
                acc1_starting_balance = _balance;
                return getBalance(acc2);
            })
            .then(function(_balance){
                acc2_starting_balance = _balance;
                return splitter_instance.payInto({from: acc0, value:amt})
            })
            .then(function(){
                return getBalance(acc1)
            })
            .then(function(_balance){
                acc1_ending_balance = _balance;
                return getBalance(acc2)
            })
            .then(function(_balance){
                acc2_ending_balance = _balance;
                assert.equal(acc1_ending_balance.toString(10), acc1_starting_balance.plus(half).toString(10), "balance should increase by " + half);
                assert.equal(acc2_ending_balance.toString(10), acc1_starting_balance.plus(half).toString(10), "balance should increase by " + half);
            })
    });

});


function getBalance(address) {
    return web3.eth.getBalancePromise(address).then(balance => {
        return balance;
    });
}
