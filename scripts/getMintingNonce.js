const Web3 = require('web3');
const minimist = require('minimist');

module.exports = async(callback) => {
  var argv = minimist(process.argv.slice(2));
  const SaitoTokenJson = require(`../deployments/${argv["network"]}-0x${argv["tokenaddr"]}/SaitoToken.json`);
  let saitoTokenContract = new web3.eth.Contract(SaitoTokenJson.abi, `0x${argv["tokenaddr"]}`);
  let nonce = await saitoTokenContract.methods.getMintingNonce().call();
  console.log(nonce);
  callback();  
}
