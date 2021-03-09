// const config = require("./config.js");
// const web3 = require('web3');
// try{
//   exports.web3 = new web3(web3.givenProvider || new web3.providers.HttpProvider(config.parityHost)); // QA parity
// } catch(err){
//   console.log("cannot connect to Ethereum node.")
//   console.log(err)
//   throw err;
// }


module.exports = async(callback) => {
  console.log("asdf");
  let accounts = await web3.eth.getAccounts();
  console.log(accounts);
  // perform actions
  return;
}