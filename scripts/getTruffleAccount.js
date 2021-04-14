const minimist = require('minimist');

module.exports = async(callback) => {
  console.log(web3.eth.currentProvider.addresses);
  callback();  
}
