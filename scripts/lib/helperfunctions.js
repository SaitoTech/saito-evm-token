
const readline = require('readline');
const Writable = require('stream').Writable;
let signMessageWithNonce = async(nonce, amount, account, webThree) => {
  let data = (nonce * 2 ** 32) + amount;
  let hexData = webThree.utils.toHex(data).slice(2)
  return await manuallySign(hexData, account, webThree);
}

let getPassword = async() => {
  return new Promise((resolve, reject) => {
    var mutableStdout = new Writable({
      write: function(chunk, encoding, callback) {
        if (!this.muted)
          process.stdout.write(chunk, encoding);
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

let manuallySign = async(hexData, account, webThree) => {
  let ret = [];
  
  for(let i = hexData.length; i < 64; i++) {
    hexData = "0" + hexData
  }
  let message = "0x" + hexData;
  //let sig = (await web3.eth.accounts.sign(message, privateKey)).signature.slice(2);
  let sig = (await webThree.eth.sign(message, account)).slice(2);
  //let sig = (await web3.eth.sign(message, ownr)).slice(2);
  let r = "0x" + sig.slice(0, 64);
  let s = "0x" + sig.slice(64, 128);
  let v = webThree.utils.toDecimal('0x' + sig.slice(128, 130)) + 27
  if(v == 54) { v = 27;}
  if(v == 55) { v = 28;}
  ret.push(message);
  ret.push(v);
  ret.push(r);
  ret.push(s);
  return ret;
}
module.exports = {
  signMessageWithNonce,
  getPassword
};

//export { signMessage, signMessageWithNonce };