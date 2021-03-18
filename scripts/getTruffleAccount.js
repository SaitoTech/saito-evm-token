const minimist = require('minimist');

const { callMethod, splitSignature, addEncryptedAccountToWeb3Wallet } = require('./lib/helperfunctions');

module.exports = async(callback) => {
  console.log(web3.eth.currentProvider.addresses);
  callback();  
}
