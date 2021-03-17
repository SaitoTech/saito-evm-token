const minimist = require('minimist');
const readline = require('readline');
const Writable = require('stream').Writable;

const { callMethod, splitSignature, addEncryptedAccountToWeb3Wallet } = require('./lib/helperfunctions');

module.exports = async(callback) => {
  console.log(web3.eth.currentProvider.addresses);
  callback();  
}
