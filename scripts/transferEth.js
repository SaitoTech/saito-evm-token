const minimist = require('minimist');

const { addEncryptedAccountToWeb3Wallet } = require('./lib/helperfunctions');

module.exports = async(callback) => {
  try {  
    var argv = minimist(process.argv.slice(2), {string: ["amount"]});
    let account = await addEncryptedAccountToWeb3Wallet(argv["keyfile"], web3);
    console.log(argv["amount"]);
    
    let gasPrice = argv["gasprice"];
    let result = await web3.eth.sendTransaction({
      to: `0x${argv["to"]}`,
      from: account.address,
      value: web3.utils.toWei(argv["amount"], "ether"),
      gasPrice: gasPrice,
      gas: 21000,
    });
    
    console.log("transaction confirmed!");
    console.log(result);
  } catch(err) {
    console.log(err);
  }
  callback();  
}