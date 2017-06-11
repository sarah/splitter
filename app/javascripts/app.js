
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


    sendSplittable: function(){
        console.log("in sendSplittable")

        var self = this;
        var txHash;
        var amount = parseInt(document.getElementById("amount").value);
        var sender = document.getElementById("sender_addr").value;
        var splitterAddress = document.getElementById("splitter_addr").value;
        var splitter_i;

        this.setStatus("Initiating split transaction...(hang on)");

        Splitter.deployed().then(function(instance){
            console.log('initiatiating payInto')
            splitter_i = instance;
            txHash =  splitter_i.payInto({from:sender,value:amount});
            console.log('txHash is:', txHash)
            return txHash;
        }).then(function(txHash){
            console.log('in promise with txHash', txHash);
            console.log('getTransactionReceiptPromise is', web3.eth.getTransactionReceiptPromise);
            console.log('this is where to tease out tx started & tx receipt');
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
