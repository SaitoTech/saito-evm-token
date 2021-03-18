const minimist = require('minimist');
const readline = require('readline');
const Writable = require('stream').Writable;

const { callMethod, splitSignature, addEncryptedAccountToWeb3Wallet } = require('./lib/helperfunctions');

module.exports = async(callback) => {
  try {  
    var argv = minimist(process.argv.slice(2));
    let nonce = await web3.eth.getTransactionCount(`0x${argv["addr"]}`);
    console.log(nonce);
    // const SaitoTokenJson = require(`../deployments/${argv["network"]}-0x${argv["tokenaddr"]}/SaitoToken.json`);
    // let saitoTokenContract = new web3.eth.Contract(SaitoTokenJson.abi, `0x${argv["tokenaddr"]}`);
    // let splitSig1 = splitSignature(argv["sig1"], web3);
    // let splitSig2 = splitSignature(argv["sig2"], web3);
    // let splitSig3 = splitSignature(argv["sig3"], web3);
    // 
    // let account = await addEncryptedAccountToWeb3Wallet(argv, web3);
    // let method = saitoTokenContract.methods.mint("0x" + argv["message"], "" + splitSig1[0], "" + splitSig1[1], "" + splitSig1[2], "" + splitSig2[0], "" + splitSig2[1], "" + splitSig2[2], "" + splitSig3[0], "" + splitSig3[1], "" + splitSig3[2]);
    // let gasMultiple = argv["network"] == "ropsten" ? 3.0 : 1.0;
    // 
    // let gasPrice = argv["gasprice"];
    // if(argv["network"] == "ropsten") {
    //   gasPrice = 20*(await web3.eth.getGasPrice());
    // }
    // if(argv["network"] == "development") {
    //   gasPrice = 1;
    // }
    // let result = await callMethod(method, account.address, gasPrice, web3);
    // console.log("Mint transaction confirmed!");
    // console.log(result);
  } catch(err) {
    console.log(err);
  }
  callback();  
}
