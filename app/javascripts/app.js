
// Styles
import "../stylesheets/app.css";

// Packages
import { default as Web3} from 'web3';
import { default as truffleContract } from 'truffle-contract'
import { default as Promise } from 'bluebird'

// Splitter
import splitterJSON from '../../build/contracts/Splitter.json'
const Splitter = truffleContract(splitterJSON);

// Vars
var accounts, account, splitter;
var a,b,c;
var receipt_log;
var tx_log1;
var tx_log2;

// Checking if Web3 has been injected by the browser (Mist/MetaMask)
// Otherwise using localhost
// funder: 0x8c8dc204e78be6a3348affd2311db5bc75d47d27
// splitter:0xffbdbf783cef70b8bd6e449dc0cebcc079504a96
if (typeof web3 !== 'undefined') {
    window.web3 = new Web3(web3.currentProvider); // Use Mist/MetaMask's provider
} else {
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

Promise.promisifyAll(web3.eth, { suffix: "Promise" });

window.App = {
    start: function() {
        var self = this;

        // Bootstrap the Splitter abstraction for Use.
        Splitter.setProvider(web3.currentProvider);

        // Get the initial account balance so it can be displayed.
        web3.eth.getAccounts(function(err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }

            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }

            console.log("accounts", accs)
            accounts = accs;
            account = accounts[0];
            self.refreshBalance();
        });
    },

    setStatus: function(message) {
        var status = document.getElementById("status");
        status.innerHTML = message;
    },

    refreshBalance: function(){
        console.log('Refreshing balance...');
        var self = this;
        return Splitter.deployed().then(function(instance){
            return web3.eth.getBalancePromise(instance.address)
                .then(function(balance){
                    console.log('balance', balance)
                    document.getElementById("splitter_balance").innerHTML = balance.toString(10);
                })
                .catch(function(err){
                    console.log('error', err);
                })
        });
    },

    sendSplittable: function(){
        var self = this;
        var txHashPromise;
        var amount = parseInt(document.getElementById("amount").value);
        var sender = document.getElementById("sender_addr").value;
        let splitterInstance;
        var r;
        var tx;
        console.log('sender', sender, 'account', account);

        this.setStatus("Initiating split transaction...(hang on)");
        // when I run this line in truffle console, I get a receipt with a bunch of logs:
        // Splitter.deployed().then(function(i){tx = i.deposit.sendTransaction({from:web3.eth.accounts[0],value:web3.toWei(5,"ether")})}).then(function(tx){tx3 = tx})
        // when i run the code below I get a receipt with 0 logs. what am i doing wrong here.
        return Splitter.deployed().then(function(i){
            tx = i.deposit.sendTransaction({from:web3.eth.accounts[0],value:web3.toWei(5,"ether")})})
            .then(function(tx){
                const waitForReceiptPromise = function tryAgain() {
                    return web3.eth.getTransactionReceiptPromise(tx).then(function (receipt) {
                        return receipt !== null ? receipt : Promise.delay(500).then(tryAgain);
                    });
                };
                return waitForReceiptPromise();
            })
            .then(function(receipt){
                r = receipt;
                console.log('receipt logs', receipt.logs);
            })
            .catch(function(err){
                console.log("Oh no!", err);
                self.setStatus("error sending splittable");
            });


        //return Splitter.deployed().then(function(instance){
            //txHashPromise = instance.deposit.sendTransaction({from:sender,value:web3.toWei(amount, "ether")});
            //self.setStatus("Transaction initiated...", txHashPromise);
            //return txHashPromise;
        //}).then(function(txHash){
            //console.log("output",txHash);
            //const waitForReceiptPromise = function tryAgain() {
                //return web3.eth.getTransactionReceiptPromise(txHash).then(function (receipt) {
                    //return receipt !== null ? receipt : Promise.delay(500).then(tryAgain);
                //});
            //};
            //return waitForReceiptPromise();
        //}).then(function(receipt){
            //r = receipt;
            //console.log("receipt logs", receipt.logs);
            //console.log("we have a receipt", receipt);
            //self.setStatus("Success!");
            //self.refreshBalance();
        //}).catch(function(err){
            //console.log("Oh no!", err);
            //self.setStatus("error sending splittable");
        //})
    },
};

window.addEventListener('load', function() {
    App.start();
});
