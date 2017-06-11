
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
// s = 0xefd272f787e5fe34cb11d6eb3e3c78a58377661d
// a = 0x594f46cb925ebd73a364335f53ddb6ede750474a

// Checking if Web3 has been injected by the browser (Mist/MetaMask)
// Otherwise using localhost
if (typeof web3 !== 'undefined') {
    window.web3 = new Web3(web3.currentProvider); // Use Mist/MetaMask's provider
} else {
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

Promise.promisifyAll(web3.eth, { suffix: "Promise" });

window.App = {
    start: function() {
        var self = this;

        console.log("web3 in start", web3);
        // Bootstrap the MetaCoin abstraction for Use.
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
        var splitter_i;
        Splitter.deployed().then(function(instance){
            splitter_i = instance;
            return web3.eth.getBalancePromise(splitter_i.address)
                .then(function(balance){
                    console.log('balance', balance)
                    document.getElementById("splitter_balance").innerHTML = balance.toString(10);
                })
                .catch(function(err){
                    console.log('error', err);
                })
        });
    },
    refreshBalanceCallback: function(){
        console.log('Refreshing balance...');
        var self = this;
        var splitter_i;
        Splitter.deployed().then(function(instance){
            splitter_i = instance;
            web3.eth.getBalance(splitter_i.address,function(err,res){
                if(err){
                    console.log("error", err);
                    return;
                }
                console.log(res);
                // could pass to a 'display balance' function here
                document.getElementById("splitter_balance").innerHTML = res.toString(10);
            })
        })
    },

    refreshBalanceOld: function() {
        console.log('in refreshBalance');
        var self = this;
        var splitter_i;
        var balance;
        Splitter.deployed().then(function(instance) {
            splitter_i = instance;
            balance = splitter_i.getBalance.call();
            return balance;
        }).then(function(balances) {
            document.getElementById("splitter_balance").innerHTML = balances.toString(10);
        }).catch(function(e) {
            self.setStatus("Error getting balance; see log.", e);
        });
    },

    sendSplittable: function(){
        console.log("in sendSplittable")
        var self = this;
        var txHash;

        var amount = parseInt(document.getElementById("amount").value);
        var sender = document.getElementById("sender_addr").value;
        var splitterAddress = document.getElementById("splitter_addr").value;

        this.setStatus("Initiating split transaction...(hang on)");
        var splitter_i;
        Splitter.deployed().then(function(instance){
            splitter_i = instance;
            txHash =  splitter_i.payInto({from:sender,value:amount});
            console.log("is this txHash", txHash);
            return txHash;
        }).then(function(txHash){
            console.log('txHash', txHash);
            self.setStatus("Transaction complete!");
            self.refreshBalance();
        }).catch(function(e){
            console.log("Oh no!", e);
            self.setStatus("error sending splittable");
        })
    },
};

window.addEventListener('load', function() {
    App.start();
});
