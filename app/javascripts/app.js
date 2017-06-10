// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import splitter_artifacts from '../../build/contracts/Splitter.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var Splitter = contract(splitter_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts, account, splitter;
var a,b,c;
//s = 0x0bba448a97e82db6695f2ae41b78d7d357dfe9f7
//a = 0x594f46cb925ebd73a364335f53ddb6ede750474a

window.App = {
    start: function() {
        var self = this;

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

    refreshBalance: function() {
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
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    App.start();
});
