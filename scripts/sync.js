
const Web3 = require('web3');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));
const SaitoTokenJson = require(`../deployments/${argv["network"]}-0x${argv["tokenaddr"]}/SaitoToken.json`);
const saitoTokenContract = new web3.eth.Contract(SaitoTokenJson.abi, `0x${argv["tokenaddr"]}`);

module.exports = async(callback) => {
  try {
    const firstUnsyncedBlockNumber = 0;
    const lastBlockNumber = (await web3.eth.getBlock('latest')).number;
    const eventType = "Burned";  
    
    await saitoTokenContract.getPastEvents(eventType, {
        fromBlock: firstUnsyncedBlockNumber,
        toBlock: lastBlockNumber,
      },
      async(error, events) => {
        if(error) {
          console.log("error occured while synchronizing past events");
          console.log(error);
          throw error;
        } else {
          if(events.length > 0){
            console.log("Found " + events.length + " " + eventType + " events.");
          } else {
            console.log("No events");
          }
          for(let i = 0; i < events.length; i++) {
            console.log("");
            console.log("txhash:\t\t" + events[i].transactionHash);
            console.log("blockhash:\t" + events[i].blockHash);
            console.log("blocknum:\t" + events[i].blockNumber);
            console.log("eventType:\t" + eventType);
            console.log("from:\t\t" + events[i].returnValues.from);
            console.log("amount:\t\t" + events[i].returnValues.amount);
            console.log("Saito address:\t" + events[i].returnValues.data);
            // Minted event data:
            // console.log("amount:\t\t" + events[i].returnValues.amount);
            // console.log("receiver:\t" + events[i].returnValues.receiver);
          }
        }
      }
    );
    
  } catch (err) {
    console.log("ERROR");
    console.log(err);
  } finally {
    callback();
  }
}