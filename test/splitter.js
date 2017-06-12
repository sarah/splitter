const Web3 = require('web3')
var Splitter = artifacts.require("./Splitter.sol");


contract("Splitter", accounts => {
    console.log('accounts', accounts);
});
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
