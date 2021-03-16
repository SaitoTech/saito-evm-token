const readline = require('readline');
const Writable = require('stream').Writable;
const fs = require('fs/promises');

let gasEstimateOverhead = 1000;

let signMessageForTesting = async(nonce, amount, account, webThree) => {
  let message = makeMintingMessage32(nonce, amount, webThree);
  let sig = await manuallySign(message, account, webThree);
  return {
    message: message,
    sigObj: splitSignature(sig, webThree)
  };
}

// We pass webThree in because in a truffle context web3 is already in the global
// namespace, whereas with our custom node scripts we need to instantiate it. 

let getBalance = async(pubkey, webThree) => {
  return await new Promise(async(resolve, reject) => {
    webThree.eth.getBalance(pubkey, function(error, result) {
      if(error){
        reject(error)
      }
      resolve(result);
    });
  }).catch(err => {
    throw err;
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
    return 79990000000000;
  }
  return gasAmount;
}
let callMethod = (method, fromPubkey, gasPrice, webThree) => {
  return new Promise(async(resolve, reject) => {
    let nonce = await webThree.eth.getTransactionCount(fromPubkey);
    let options = {
      //nonce: web3.utils.toHex(nonce) + 1,
      from: fromPubkey,
      gas: 21000,
      gasPrice: gasPrice,
    }
    // let gasEstimate = await estimateGas(method, options);
    // console.log("gasEstimate");
    // console.log(gasEstimate);
    //options.gas = gasEstimate + gasEstimateOverhead;
    options.gas = 800000;
    options.nonce = await webThree.eth.getTransactionCount(fromPubkey);
    console.log("options.gas: " + options.gas);
    console.log("options.nonce: " + options.nonce);
    let ethBal = await getBalance(fromPubkey, webThree);
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
let addEncryptedAccountToWeb3Wallet = async (argv, webThree) => {
  let fd = await fs.open(argv["keyfile"], "r", "700");
  let keyfileBuffer = await fd.readFile();
  let encryptedWallet = JSON.parse(keyfileBuffer.toString());
  let pwd = await getPassword();
  console.log("");
  let wallet = webThree.eth.accounts.wallet.decrypt(encryptedWallet, pwd);
  //return wallet;
  webThree.eth.accounts.wallet.add(wallet[0]);
  return wallet[0];
}
let makeMintingMessage32 = (nonce, amount, webThree) => {
  let BN = webThree.utils.BN;
  // This is equivalent to: (nonce * 2**64) + amount;
  // We are bit-shifting the nonce up 128 bits to make room for the amount.
  let dataBN = new BN(nonce).mul(new BN("100000000000000000000000000000000", 16)).add(new BN(amount));
  
  let hexData = webThree.utils.toHex(dataBN).slice(2);
  for(let i = hexData.length; i < 64; i++) {
    hexData = "0" + hexData;
  }
  return "0x" + hexData;
}

let splitSignature = (sig, webThree) => {
  let ret = [];
  let r = "0x" + sig.slice(0, 64);
  let s = "0x" + sig.slice(64, 128);
  let v = webThree.utils.toDecimal('0x' + sig.slice(128, 130)) + 27;
  if(v == 54) { v = 27;}
  if(v == 55) { v = 28;}
  ret.push(v);
  ret.push(r);
  ret.push(s);
  return ret;
}

let manuallySign = async(message, account, webThree) => {
  
  // let message = "0x1337beef" + forUser.slice(2) + hexData;
  // let privateKey = await exports.getOwnerPrivKey();
  // let sig = (await web3.eth.accounts.sign(message, privateKey)).signature.slice(2);
  let sig = (await webThree.eth.sign(message, account)).slice(2);
  return sig;
}

let getPassword = async() => {
  return new Promise((resolve, reject) => {
    var mutableStdout = new Writable({
      write: function(chunk, encoding, callback) {
        if (!this.muted) {
          process.stdout.write(chunk, encoding);
        }
        callback();
      }
    });
    mutableStdout.muted = false;
    var rl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true
    });
    rl.question('Password: ', function(password) {
      resolve(password);
      rl.close();
    });
    mutableStdout.muted = true;
  });
}

module.exports = {
  callMethod,
  addEncryptedAccountToWeb3Wallet,
  signMessageForTesting,
  getPassword,
  makeMintingMessage32,
  manuallySign,
  splitSignature,
};

//export { signMessage, signMessageForTesting };