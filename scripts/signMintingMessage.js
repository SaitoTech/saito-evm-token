const Web3 = require('web3');
const minimist = require('minimist');
const fs = require('fs').promises;

const { makeMintingMessage32, manuallySign, addEncryptedAccountToWeb3Wallet } = require('./lib/helperfunctions');

let main = async() => {
  let web3 = new Web3();
  let BN = web3.utils.BN;
  var argv = minimist(process.argv.slice(2));
  let account;
  if(argv["keyfile"]) {
    account = await addEncryptedAccountToWeb3Wallet(argv["keyfile"], web3);  
  } else if(argv["privkey"]) {
    account = web3.eth.accounts.wallet.add(argv["privkey"]);
  }
  let amount = new BN(parseInt(argv["amount"], 10)).mul(new BN(10).pow(new BN(18)));
  let message = makeMintingMessage32(parseInt(argv["nonce"], 10), amount, web3);
  let sig = await manuallySign(message, account.address, web3);
  console.log("message: " + message.slice(2));
  console.log("signature: " + sig);
}
main();
