const minimist = require('minimist');

module.exports = async(callback) => {
  try {  
    var argv = minimist(process.argv.slice(2));
    let nonce = await web3.eth.getTransactionCount(`0x${argv["addr"]}`);
    console.log(nonce);
  } catch(err) {
    console.log(err);
  }
  callback();  
}
