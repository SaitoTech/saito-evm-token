const minimist = require('minimist');

const { sendRawJsonTx } = require('./lib/helperfunctions');

module.exports = async(callback) => {
  try {  
    var argv = minimist(process.argv.slice(2));
    let receipt = await sendRawJsonTx(argv["serializedtx"], web3);
    console.log(receipt);
  } catch(err) {
    console.log(err);
  }
  callback();  
}
