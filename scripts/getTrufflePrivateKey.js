const minimist = require('minimist');

module.exports = async(callback) => {
  
  const accounts = await web3.eth.getAccounts();
  console.log(web3.eth.currentProvider.addresses[0]);
  console.log(web3.eth.currentProvider.wallets[web3.eth.currentProvider.addresses[0]].privateKey.toString('hex'));
  callback();  
}
