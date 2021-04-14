const readline = require('readline');
const Writable = require('stream').Writable;
const fs = require('fs').promises;
const EthereumTx = require('ethereumjs-tx').Transaction;
const gasEstimateOverhead = 1000;

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
  try {
    gasAmount = await method.estimateGas(options);
  } catch (err) {
    console.log("estimate gas error")
    console.log(err)
    return 79990000000000;
  }
  return gasAmount;
}

let buildOptions = async(fromPubkey, gasPrice, webThree) => {
  let options = {
    from: fromPubkey,
    gas: 21000,
    gasPrice: gasPrice,
  }
  options.gas = 800000;
  options.nonce = await webThree.eth.getTransactionCount(fromPubkey);
  let ethBal = await getBalance(fromPubkey, webThree);
  if(options.gas * gasPrice > ethBal) {
    throw "Not enough ethereum to pay for gas.";
  }
  return options;
}

let buildRawTx = async(txabi, tokenaddr, from, fromnonce, gasPrice, webThree) => {
  try {
    var privateKey = Buffer.from(webThree.eth.accounts.wallet[from].privateKey.slice(2), 'hex');
    var rawTx = {
      nonce: webThree.utils.toHex(fromnonce),
      gasPrice: webThree.utils.toHex(gasPrice),
      gasLimit: webThree.utils.toHex(800000),
      to: tokenaddr,
      value: '0x00',
      data: txabi
    }
    var tx = new EthereumTx(rawTx, {'chain':'ropsten'});
    tx.sign(privateKey);
    var serializedTx = tx.serialize();
    return JSON.stringify(serializedTx.toJSON());
  } catch(err) {
    console.log(err);
  }
} 

let sendRawJsonTx = (jsonTx, webThree) => {
  return new Promise(async(resolve, reject) => {
    let serializedTx = Buffer.from(JSON.parse(jsonTx));
    webThree.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('transactionHash', () => {
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
      console.log("sendRawJsonTx error..");
      console.log(error);
    });
  });
}

let sendRawTx = (txabi, tokenaddr, from, gasPrice, webThree) => {
  return new Promise(async(resolve, reject) => {
    try {
      var Tx = require('ethereumjs-tx').Transaction;
      var privateKey = Buffer.from(webThree.eth.accounts.wallet[from].privateKey.slice(2), 'hex');
      var rawTx = {
        nonce: webThree.utils.toHex(await webThree.eth.getTransactionCount(from)),
        gasPrice: webThree.utils.toHex(gasPrice),
        gasLimit: webThree.utils.toHex(800000),
        to: tokenaddr,
        value: '0x00',
        data: txabi
      }
      var tx = new Tx(rawTx, {'chain':'ropsten'});
      tx.sign(privateKey);
      var serializedTx = tx.serialize();
      webThree.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('transactionHash', () => {
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
        console.log("sendRawTx error..");
        console.log(error);
      });
    } catch(err) {
      console.log("sendRawTx error");
      console.log(err);
      reject(err);
    }
  });
}


let callMethod = (method, from, gasPrice, webThree) => {
  return new Promise(async(resolve, reject) => {
    let options = await buildOptions(from, gasPrice, webThree);
    try{
      method.send(options)
        .on('error', async(error) => {
          console.log("****** error ******")
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
          reject(error);
        }) ;  
    } catch(err) {
      console.log("method.send error");
      console.log(err);
      reject(err);
    }
  });
}
let addEncryptedAccountToWeb3Wallet = async (keyfile, webThree) => {
  let fd = await fs.open(keyfile, "r", "700");
  let keyfileBuffer = await fd.readFile();
  let encryptedWallet = JSON.parse(keyfileBuffer.toString());
  let pwd = await getPassword();
  console.log("");
  let wallet = webThree.eth.accounts.wallet.decrypt(encryptedWallet, pwd);
  webThree.eth.accounts.wallet.add(wallet[0]);
  return wallet[0];
}
let makeMintingMessage32 = (nonce, amount, webThree) => {
  // This is equivalent to: (nonce * 2**64) + amount;
  // We are bit-shifting the nonce up 128 bits to make room for the amount.
  let BN = webThree.utils.BN;
  let amountBN = new BN(amount);
  //let bitShifterBN = new BN("100000000000000000000000000000000", 16);
  let nonceBN = new BN(nonce);
  let amountHexData = webThree.utils.toHex(amountBN).slice(2);
  for(let i = amountHexData.length; i < 32; i++) {
    amountHexData = "0" + amountHexData;
  }
  let nonceHexData = webThree.utils.toHex(nonceBN).slice(2);
  for(let i = nonceHexData.length; i < 32; i++) {
    nonceHexData = "0" + nonceHexData;
  }
  return "0x" + nonceHexData + amountHexData;
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
  sendRawJsonTx,
  buildRawTx,
  callMethod,
  sendRawTx,
  addEncryptedAccountToWeb3Wallet,
  getPassword,
  makeMintingMessage32,
  manuallySign,
  splitSignature,
};
