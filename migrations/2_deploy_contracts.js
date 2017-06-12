var Migrations = artifacts.require("./Migrations.sol");
var Splitter = artifacts.require("./Splitter.sol");

module.exports = function(deployer, network, accounts) {
  console.log(`account0 = ${accounts[0]}, account1 = ${accounts[1]}, account2 = ${accounts[2]}`);
  deployer.deploy(Splitter,accounts[0], accounts[1], accounts[2]);
};
