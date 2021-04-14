const Web3 = require('web3');
const minimist = require('minimist');
const { makeMintingMessage32, manuallySign, addEncryptedAccountToWeb3Wallet } = require('./lib/helperfunctions');

let main = async() => {
  let web3 = new Web3();
  var argv = minimist(process.argv.slice(2));
  let account;
  if(argv["keyfile"]) {
    account = await addEncryptedAccountToWeb3Wallet(argv["keyfile"], web3);  
  } else if(argv["privkey"]) {
    account = web3.eth.accounts.wallet.add(argv["privkey"]);
  }
  console.log(account.address);
}
main();
