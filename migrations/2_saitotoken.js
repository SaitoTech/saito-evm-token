const SaitoTokenV1 = artifacts.require("SaitoTokenV1");
const SaitoTokenV2 = artifacts.require("SaitoTokenV2");
const SaitoTokenV3 = artifacts.require("SaitoTokenV3");
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
    //await deployer.deploy(SaitoTokenV3, "SaitoTokenV3", "STO", "0x" + argv["owner1"], "0x" + argv["owner2"], "0x" + argv["owner3"]);
    await deployer.deploy(SaitoTokenV3, "SaitoTokenV3", "STO");
    let abiDirName = deployer.network + "-" + SaitoTokenV3.address;
    let network = deployer.network.replace("-fork","");
    save(network + "-" + SaitoTokenV3.address);
    console.log(" ***************** Saved ABIs to deployments/" + abiDirName + "*******************");
  }
};
