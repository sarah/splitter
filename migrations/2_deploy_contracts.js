var Migrations = artifacts.require("./Migrations.sol");
var Splitter = artifacts.require("./Splitter.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Splitter);
};
