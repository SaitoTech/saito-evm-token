const Web3 = require('web3');
const minimist = require('minimist');
const readline = require('readline');
const Writable = require('stream').Writable;

module.exports = async(callback) => {
  var argv = minimist(process.argv.slice(2));
  const SaitoTokenJson = require(`../deployments/${argv["network"]}-0x${argv["tokenaddr"]}/SaitoTokenV3.json`);
  let saitoTokenContract = new web3.eth.Contract(SaitoTokenJson.abi, `0x${argv["tokenaddr"]}`);
  let nonce = await saitoTokenContract.methods.getMiningNonce().call();
  console.log(nonce);
  callback();  
}
