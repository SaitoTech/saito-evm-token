const minimist = require('minimist');
const fs = require('fs/promises');
const readline = require('readline');
const Writable = require('stream').Writable;

const { splitSignature, getPassword } = require('./lib/helperfunctions');

let gasEstimateOverhead = 1000;

let getBalance = async(pubkey) => {
  return await new Promise(async(resolve, reject) => {
    web3.eth.getBalance(pubkey, function(error, result) {
      if(error){
        reject(error)
      }
      resolve(result);
    });
  }).catch(err => {
    throw err
  });
}

let estimateGas = async(method, options) => {
  let gasAmount = 7999000;
  //return gasAmount;
  try {
    gasAmount = await method.estimateGas(options);
  } catch (err) {
    console.log("estimate gas error")
    console.log(err)
    return 7999000;
  }
  return gasAmount;
}

let callMethod = (method, fromPubkey, gasPrice) => {
  return new Promise(async(resolve, reject) => {
    let nonce = await web3.eth.getTransactionCount(fromPubkey);
    let options = {
      //nonce: web3.utils.toHex(nonce) + 1,
      from: fromPubkey,
      gas: 21000,
      gasPrice: gasPrice,
    }
    let gasEstimate = await estimateGas(method, options);
    console.log("gasEstimate");
    console.log(gasEstimate);
    options.gas = gasEstimate + gasEstimateOverhead;
    options.nonce = await web3.eth.getTransactionCount(fromPubkey);
    console.log("options.gas: " + options.gas);
    console.log("options.nonce: " + options.nonce);
    let ethBal = await getBalance(fromPubkey);
    console.log("balance: " + ethBal);
    if(options.gas * gasPrice > ethBal) {
      reject("Not enough ethereum to pay for gas.");
    }
    try{
      method.send(options)
        .on('error', async(error) => {
          console.log("****** sendContractCall error ******")
          console.log(error);
          reject(error);
        })
        .on('transactionHash', () => {
          console.log("Transaction Broadcast Acknowledged...");
        })
        .on('receipt', () => {
          console.log("onReceipt");
        })
        .on('confirmation', function(confirmationNumber, receipt){
          console.log("Transaction Confirmed!")
          resolve(receipt);
        }).then(function(newContractInstance){
          console.log("then....")
        }).catch((error) =>{
          console.log("method send error..");
          console.log(error);
        }) ;  
    } catch(err) {
      console.log("method.send error");
      console.log(err);
      reject(err);
    }
    
  });
  //let txhash = await ethereum.sendContractCall(user, pin, method, options, "onSent")
}

module.exports = async(callback) => {
  var argv = minimist(process.argv.slice(2));
  const SaitoTokenJson = require(`../deployments/${argv["network"]}-0x${argv["address"]}/SaitoTokenV3.json`);
  let saitoTokenContract = new web3.eth.Contract(SaitoTokenJson.abi, `0x${argv["address"]}`);
  let splitSig1 = splitSignature(argv["sig1"], web3);
  let splitSig2 = splitSignature(argv["sig2"], web3);
  let splitSig3 = splitSignature(argv["sig3"], web3);
  
  //let nonce = await saitoTokenContract.methods.getMiningNonce().call();
  //await saitoTokenV2.mint(argv["message"], splitSig1[0], splitSig1[1], splitSig1[2], splitSig2[0], splitSig2[1], splitSig2[2], splitSig3[0], splitSig3[1], splitSig3[2], {from: owner1});
  try {
    //web3.eth.accounts.wallet.clear();
    let account = addEncryptedAccountToWeb3Wallet(web3);
    // let fd = await fs.open(argv["keyfile"], "r", "700");
    // let keyfileBuffer = await fd.readFile();
    // let encryptedWallet = JSON.parse(keyfileBuffer.toString());
    // let pwd = await getPassword();
    // console.log("");
    // let wallet = web3.eth.accounts.wallet.decrypt(encryptedWallet, pwd);
    // web3.eth.accounts.wallet.add(wallet[0]);
    
    
    let method = saitoTokenContract.methods.mint("0x" + argv["message"], splitSig1[0], splitSig1[1], splitSig1[2], splitSig2[0], splitSig2[1], splitSig2[2], splitSig3[0], splitSig3[1], splitSig3[2]);
    let gasMultiple = argv["network"] == "ropsten" ? 3.0 : 1.0;
    
    let gasPrice = argv["gasprice"];
    if(argv["network"] == "ropsten") {
      gasPrice = 20*(await web3.eth.getGasPrice());
    }
    let result = await callMethod(method, account.address, gasPrice);
    console.log(result);
  } catch(err) {
    console.log(err);
  }
  
  callback();  
}
