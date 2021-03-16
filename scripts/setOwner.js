// const minimist = require('minimist');
// const readline = require('readline');
// const Writable = require('stream').Writable;
// 
// const { splitSignature, getPassword } = require('./lib/helperfunctions');
// 
// let gasEstimateOverhead = 1000;
// 
// 
// module.exports = async(callback) => {
//   try {
//     const SaitoTokenJson = require(`../deployments/${argv["network"]}-0x${argv["tokenaddr"]}/SaitoTokenV3.json`);
//     let saitoTokenContract = new web3.eth.Contract(SaitoTokenJson.abi, `0x${argv["tokenaddr"]}`);  
//     var argv = minimist(process.argv.slice(2));
//     let account = await addEncryptedAccountToWeb3Wallet(argv, web3);
// 
//     // await saitoTokenV3.setOwner2(owner2, {from: owner1});
//     // await saitoTokenV3.setOwner3(owner3, {from: owner1});
//     let method = saitoTokenContract.methods.setOwner2(`0x${argv["addr"]}`);
//     let gasMultiple = argv["network"] == "ropsten" ? 3.0 : 1.0;
// 
//     let gasPrice = argv["gasprice"];
//     if(argv["network"] == "ropsten") {
//       gasPrice = 20*(await web3.eth.getGasPrice());
//     }
//     let result = await callMethod(method, account.address, gasPrice, web3);
//     console.log(result);
//   } catch(err) {
//     console.log(err);
//   }
// 
//   callback();  
// }
