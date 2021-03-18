const minimist = require('minimist');
const readline = require('readline');
const Writable = require('stream').Writable;

const { callMethod, splitSignature, addEncryptedAccountToWeb3Wallet } = require('./lib/helperfunctions');

module.exports = async(callback) => {
  try {  
    var argv = minimist(process.argv.slice(2));
    const SaitoTokenJson = require(`../deployments/${argv["network"]}-0x${argv["tokenaddr"]}/SaitoToken.json`);
    let saitoTokenContract = new web3.eth.Contract(SaitoTokenJson.abi, `0x${argv["tokenaddr"]}`);
    console.log(JSON.stringify(SaitoTokenJson.abi));
  } catch(err) {
    console.log(err);
  }
  callback();  
}
