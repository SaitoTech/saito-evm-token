
const minimist = require('minimist');

const { callMethod, splitSignature, addEncryptedAccountToWeb3Wallet } = require('./lib/helperfunctions');

module.exports = async(callback) => {
  
  const accounts = await web3.eth.getAccounts();
  console.log(accounts[0]);
  console.log(web3.eth.currentProvider.addresses[0]);
  console.log(web3.eth.currentProvider.wallets['0x4972e9b94ac09dc01da913b2c5cca8671a7df84b']);
  console.log(web3.eth.currentProvider.wallets[web3.eth.currentProvider.addresses[0]]);
  console.log(web3.eth.currentProvider.wallets[web3.eth.currentProvider.addresses[0]].privateKey);
  console.log(web3.eth.currentProvider.wallets[web3.eth.currentProvider.addresses[0]].privateKey.toString());
  console.log(web3.eth.currentProvider.wallets[web3.eth.currentProvider.addresses[0]].privateKey.toString('hex'));
  //console.log(web3.eth.currentProvider.wallets[accounts[0]].privateKey);
  // console.log(web3.eth.currentProvider.wallets[accounts[0]].privateKey.toString());
  // console.log(web3.eth.currentProvider.wallets[accounts[0]].privateKey.toString('hex'));
  
  //console.log(web3.eth.currentProvider.wallets[0].privateKey);
  // console.log(web3.eth.accounts.wallet);
  // 
  // console.log(accounts.wallet);
  // console.log(accounts[0].privateKey);
  // console.log(web3.eth.accounts.wallet);
  // console.log(web3.eth.accounts.wallet[0]);
  callback();  
}

// 
// const Web3 = require('web3');
// const minimist = require('minimist');
// const { makeMintingMessage32, manuallySign, addEncryptedAccountToWeb3Wallet } = require('./lib/helperfunctions');
// 
// let main = async() => {
//   let web3 = new Web3();
//   var argv = minimist(process.argv.slice(2));
//   let account = await addEncryptedAccountToWeb3Wallet(argv, web3);  
//   console.log(account.address);
//   console.log(account.privateKey);
// }
// main();
