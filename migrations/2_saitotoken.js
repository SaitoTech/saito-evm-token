const SaitoToken = artifacts.require("SaitoToken");

module.exports = function (deployer) {
  // During test we just create the contract and test it directly without deploying.
  // If we want to run tests 
  if(deployer.network !== "test") {
    deployer.deploy(SaitoToken, "SaitoToken", "STO");
  }
};
