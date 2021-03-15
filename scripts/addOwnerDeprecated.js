const SaitoTokenJson = require("../build/contracts/SaitoToken.json");
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
let gasEstimateOverhead = 1000;
let transfer = (contract, fromPubkey, toPubkey, howMany) => {
  return new Promise(async(resolve, reject) => {
    let nonce = await web3.eth.getTransactionCount(fromPubkey);
    let gasPrice = await web3.eth.getGasPrice();
    let method = contract.methods.transfer(toPubkey, howMany);
    let options = {
      //nonce: web3.utils.toHex(nonce) + 1,
      from: fromPubkey,
      gas: 21000,
      gasPrice: gasPrice,
    }
    options.gas = (await estimateGas(method, options)) + gasEstimateOverhead;
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
          console.log("onTransactionHash");
        })
        .on('receipt', () => {
          console.log("onReceipt");
        })
        .on('confirmation', function(confirmationNumber, receipt){
          resolve(receipt);
        }).then(function(newContractInstance){
          console.log("then....")
        });  
    } catch(err) {
      console.log("method.send error");
      console.log(err);
      reject(err);
    }
    
  });
  //let txhash = await ethereum.sendContractCall(user, pin, method, options, "onSent")
}

let estimateGas = async(method, options) => {
  let gasAmount = 7999000;
  return gasAmount;
  try {
    gasAmount = await method.estimateGas(options);
  } catch (err) {
    console.log("estimate gas error")
    console.log(err)
  }
  return gasAmount;
}

module.exports = async(callback) => {
  console.log("addOwner");
  console.log(process.argv);
  console.log(JSON.stringify(SaitoTokenJson.abi));
  
  let accounts = await web3.eth.getAccounts();
  let saitoTokenContract = new web3.eth.Contract(SaitoTokenJson.abi, "0x379766028b24a223ad48f0dea9ed52b1276a91bb");
  let owners = await saitoTokenContract.methods.getOwners().call();
  try {
    let receipt = await transfer(saitoTokenContract, accounts[0], "0x5D4c18707e8a007ec495079c45cD676A94d8A1f6", 10000000002);
    console.log(receipt);
  } catch(err) {
    console.log("transfer failed...");
    console.log(err);
  }
  
  //
  // console.log(SaitoTokenContract);
  // chrome metamask:
  // 0x5D4c18707e8a007ec495079c45cD676A94d8A1f6
  // 10000000002
  
  // let miningPrice = parseInt(await snekContract.methods.getMiningPrice().call(), 10);
  // let pricePerEgg = parseInt(await snekContract.methods.getEggPrice().call(), 10);
  // let coinsPerEgg = parseInt(await snekContract.methods.getMiningRate().call(), 10);
  
  // 0x379766028b24a223ad48f0dea9ed52b1276a91bb
  // 0x4ee961c8b303a8f856b89736ce20f642fbeaca6e
  
  // abi: JSON.stringify(abis.snekCoin0_0_1.abi),
  //   let abis = {
  //   snekToken: require('./eth/abi/SnekCoinToken.json'),
  //   dispatcher: require('./eth/abi/Dispatcher.json'),
  //   dispatcherStorage: require('./eth/abi/DispatcherStorage.json'),
  //   snekCoinBack: require('./eth/abi/SnekCoinBack.json'),
  //   snekCoinToken: require('./eth/abi/SnekCoinToken.json'),
  //   snekCoin0_0_1: require('./eth/abi/SnekCoin0_0_1.json'),
  // }
  // perform actions
  callback();
}

