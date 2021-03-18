const Web3 = require('web3');
const minimist = require('minimist');
const readline = require('readline');
const Writable = require('stream').Writable;

module.exports = async(callback) => {
  try {
    var argv = minimist(process.argv.slice(2));
    const SaitoTokenJson = require(`../deployments/${argv["network"]}-0x${argv["tokenaddr"]}/SaitoToken.json`);
    let saitoTokenContract = new web3.eth.Contract(SaitoTokenJson.abi, `0x${argv["tokenaddr"]}`);
    let balance = await saitoTokenContract.methods.balanceOf(`0x${argv["addr"]}`).call();
    console.log(balance);
    callback();    
  } catch(err) {
    console.log(err);
  }
  
}
