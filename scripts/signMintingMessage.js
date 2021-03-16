const Web3 = require('web3');
const minimist = require('minimist');
const fs = require('fs/promises');
const readline = require('readline');
const Writable = require('stream').Writable;

const { makeMintingMessage32, manuallySign, addEncryptedAccountToWeb3Wallet } = require('./lib/helperfunctions');

let main = async() => {
  let web3 = new Web3();
  
  var argv = minimist(process.argv.slice(2));
  let account;
  if(argv["keyfile"]) {
    account = await addEncryptedAccountToWeb3Wallet(argv, web3);  
  } else if(argv["privkey"]) {
    account = web3.eth.accounts.wallet.add(argv["privkey"]);
  }
  let message = makeMintingMessage32(parseInt(argv["nonce"], 10), parseInt(argv["amount"], 10), web3);
  let sig = await manuallySign(message, account.address, web3);
  console.log("message: " + message);
  console.log("signature: " + sig);
}
main();
