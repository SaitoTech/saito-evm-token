
const readline = require('readline');
const Writable = require('stream').Writable;
let signMessageForTesting = async(nonce, amount, account, webThree) => {
  let message = "0x" + makeMintingMessage32(nonce, amount, webThree);
  let sig = await manuallySign(message, account, webThree);
  return {
    message: message,
    sigObj: splitSignature(sig, webThree)
  };
}

// We pass webThree in because in a truffle context web3 is already in the global
// namespace, whereas with our custom node scripts we need to instantiate it. 

let addEncryptedAccountToWeb3Wallet = (webThree) => {
  let fd = await fs.open(argv["keyfile"], "r", "700");
  let keyfileBuffer = await fd.readFile();
  let encryptedWallet = JSON.parse(keyfileBuffer.toString());
  let pwd = await getPassword();
  console.log("");
  let wallet = webThree.eth.accounts.wallet.decrypt(encryptedWallet, pwd);
  webThree.eth.accounts.wallet.add(wallet[0]);
  return wallet[0];
}
let makeMintingMessage32 = (nonce, amount, webThree) => {
  let data = (nonce * 2 ** 32) + amount;
  let hexData = webThree.utils.toHex(data).slice(2);
  for(let i = hexData.length; i < 64; i++) {
    hexData = "0" + hexData;
  }
  return hexData;
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
  signMessageForTesting,
  getPassword,
  makeMintingMessage32,
  manuallySign,
  splitSignature
};

//export { signMessage, signMessageForTesting };