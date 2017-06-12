const Web3 = require('web3');
const Promise = require('bluebird');
var Splitter = artifacts.require("./Splitter.sol");

Promise.promisifyAll(web3.eth, { suffix: "Promise" });

contract("Splitter", accounts => {
    let acc0 = accounts[0];
    let acc1 = accounts[1];
    let acc2 = accounts[2];
    let amt = 10;
    var acc0_starting_balance, acc1_starting_balance, acc2_starting_balance;
    var acc0_ending_balance, acc1_ending_balance, acc2_ending_balance;
    var splitter_instance;


    it('splits between b&c when money in from a', function(){
        return Splitter.deployed()
            .then(function(instance){
                splitter_instance = instance;
                console.log('in first return');
                return getBalance(acc0);
            })
            .then(function(_balance){
                acc0_starting_balance = _balance;
                console.log('acc0_starting_balance', acc0_starting_balance);
                return getBalance(acc1);
            })
            .then(function(_balance){
                acc1_starting_balance = _balance;
                console.log('acc1_starting_balance', acc1_starting_balance);
                return getBalance(acc2);
            })
            .then(function(_balance){
                acc2_starting_balance = _balance;
                console.log('acc2_starting_balance', acc2_starting_balance);
                return splitter_instance.payInto({from: acc0, value:web3.toWei(amt,"ether")})
            })
            .then(function(){
                console.log('is payInto done?');
                return getBalance(acc1)
            })
            .then(function(_balance){
                acc1_ending_balance = _balance;
                return getBalance(acc2)
            })
            .then(function(_balance){
                acc2_ending_balance = _balance;
                console.log('acc1_ending_balance', acc1_ending_balance);
                console.log('acc2_ending_balance', acc2_ending_balance);
                assert.equal(acc1_starting_balance.toString(10), acc1_ending_balance.plus(amt).toString(10), "balance should increase by " + amt/2);
                //assert.equal(b_ending_balance,b_starting_balance+5,"B's balance needs to be its existing balance + 5");
            })
    });

});


function getBalance(address) {
    return web3.eth.getBalancePromise(address).then(balance => {
        return balance;
    });
}
//contract("Splitter", function(accounts){
//describe("testing splitting", function(){
//beforeEach("deploy & prepare", function(){
//console.log("accounts", accounts);
//});
//});
//});
//contract 'Splitter', function(accounts){
//}
//contract('Splitter', function(accounts){
//it("splits money from A between B & C", function(){
//var splitter;
//var a = accounts[1];
//var b = accounts[2];
//var c = accounts[3];
//var b_starting_balance, c_starting_balance;
//var b_ending_balance, c_ending_balance;

//var amount = 10;
//console.log("amount", amount)
//return Splitter.deployed().then(instance =>{
//splitter = instance;
//return web3.eth.getBalance(b);
//}).then(b_balance =>{
//b_starting_balance = b_balance.toNumber();
//console.log("b_starting_balance",b_starting_balance);
//return web3.eth.getBalance(c);
//}).then(c_balance =>{
//c_starting_balance = c_balance.toNumber();
//console.log("c_starting_balance",c_starting_balance);
//}).then(() => {
//console.log("running payInto");
//splitter.payInto({from:a,value:web3.toWei(amount,"ether")})
//}).then(() =>{
//return web3.eth.getBalance(b);
//}).then(b_balance => {
//b_ending_balance  = b_balance;
//console.log("b_ending_balance",b_ending_balance);
//return web3.eth.getBalance(c);
//}).then(c_balance => {
//c_ending_balance  = c_balance;
//console.log("c_ending_balance",c_ending_balance);

//assert.equal(b_ending_balance,b_starting_balance+5,"B's balance needs to be its existing balance + 5");
//assert.equal(c_ending_balance,c_starting_balance+5,"C's balance needs to be its existing balance + 5");
//});
//});
//});
////it "does not split money from B or C"
