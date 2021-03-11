node scripts/generateKeypair.js --dest=<encryptedKeypairFileLocation>
truffle migrate --network=development --owner1=807c8895acc82a8dcbc76792ca3bf46f41012765 --owner2=7b87875921225b24cdcdf14f3cbb4e397f4cdfa6 --owner3=1561ddecfa7d9fe2a4d8f7890fcc324961dec501
truffle exec scripts/getNonce.js --network=development --address=EdCa8cec026F572aDf7c8E9f4Ab9C9c312c1fc38

node scripts/signMintingMessage.js  --keyfile=./test.wallet --nonce=0 --amount=1000000



//truffle exec scripts/signMintingMessage.js --network development --keyfile=./test.wallet --nonce=0 --amount=1000000
