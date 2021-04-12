const Web3 = require('web3');
const minimist = require('minimist');
const fs = require('fs').promises;

const { getPassword } = require('./lib/helperfunctions');

let main = async() => {
  let web3 = new Web3();
  let pwd = await getPassword();
  var argv = minimist(process.argv.slice(2));
  web3.eth.accounts.wallet.create(1);
  
  let encryptedWallet = web3.eth.accounts.wallet.encrypt(pwd);
  let fdDest = await fs.open(argv["dest"], "wx", "700");
  await fdDest.write(JSON.stringify(encryptedWallet));
  await fdDest.close();
  console.log("\nCreated account " + web3.eth.accounts.wallet[0].address);
  console.log("Encrypted and saved to " + argv["dest"]);
  console.log("OK");
}
main();
