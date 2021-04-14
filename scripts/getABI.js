const minimist = require('minimist');

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
