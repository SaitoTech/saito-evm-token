const Web3 = require('web3');
const minimist = require('minimist');
const fs = require('fs/promises');
const readline = require('readline');
const Writable = require('stream').Writable;

const { makeMintingMessage32, manuallySign, getPassword } = require('./lib/helperfunctions');

let main = async() => {
  let web3 = new Web3();
  var argv = minimist(process.argv.slice(2));
  let fd = await fs.open(argv["keyfile"], "r", "700");
  let keyfileBuffer = await fd.readFile();
  let encryptedWallet = JSON.parse(keyfileBuffer.toString());
  let pwd = await getPassword();
  console.log("");
  web3.eth.accounts.wallet.decrypt(encryptedWallet, pwd);
  let message = makeMintingMessage32(parseInt(argv["nonce"], 10), parseInt(argv["amount"], 10), web3);
  let sig = await manuallySign(message, web3.eth.accounts.wallet[0].address, web3);
  console.log(web3.eth.accounts.wallet[0].address);
  console.log(web3.eth.accounts.wallet[0].privateKey);
  console.log("message: " + message);
  console.log("signature: " + sig);
}
main();
