const Web3 = require('web3');
const minimist = require('minimist');
const { addEncryptedAccountToWeb3Wallet } = require('./lib/helperfunctions');

let main = async() => {
  let web3 = new Web3();
  var argv = minimist(process.argv.slice(2));
  let account = await addEncryptedAccountToWeb3Wallet(argv["keyfile"], web3);  
  console.log(account.address);
  console.log(account.privateKey);
}
main();
