const SaitoToken = artifacts.require("SaitoToken");
const shell = require('child_process').execSync;
const minimist = require('minimist');

let save = async(dirName) => {
  const src = `./build/contracts`;
  const dest = `./deployments/${dirName}`;
  shell(`mkdir -p ${dest}`);
  shell(`cp -r ${src}/* ${dest}`);
}

module.exports = async (deployer) => {
  // During test we just create the contract and test it directly without deploying.
  var argv = minimist(process.argv.slice(2));
  if(argv["_"][0] !== "test") {  
    await deployer.deploy(SaitoToken, "SAITO", "SAITO");
    let abiDirName = deployer.network + "-" + SaitoToken.address;
    let network = deployer.network.replace("-fork","");
    save(network + "-" + SaitoToken.address);
    console.log(" ***************** Saved ABIs to deployments/" + abiDirName + "*******************");
  }
};
