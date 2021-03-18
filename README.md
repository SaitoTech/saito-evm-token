# Setup:

npm i -g truffle

# Usage:

truffle test

truffle compile

# Deploying:

## 1) Generate 3 keypairs for the owners

```
node scripts/generateKeypair.js --dest=<encryptedKeypairFileLocation>
```

This stores encrypted wallets at the destination

## 2) Paste the addresses of the keypairs into the constructor of the contract

Replace these lines:

```
owner1 = 0x1111222233334444555566667777888899991111;
owner2 = 0x1111222233334444555566667777888899992222;
owner3 = 0x1111222233334444555566667777888899993333;
```

## 3) Deploy the contract

```
truffle migrate --keyfile=./test.wallet --network=ropsten --reset
```

Note the contracts address. Upon completion, this will save the contract's ABIs to the deployments directory.

## 4) Check that things look okay on etherscan(and etherchain and ethplorer)

```
https://etherscan.io/address/<tokenaddress>
and 
https://etherscan.io/token/<tokenaddress>
```

## 5) Commit the ABIs to github(in deployments directory)

```
git add deployments/<networkid>-<tokenaddress> // location given above after deployment/migration script
git commit
git push
```

## 6) Confirm that basic functions are working

```
truffle exec scripts/getNonce.js --network=ropsten --tokenaddr=0e6a11A859A252CEFd2F1cAA1fCa30fB4C31a56F
truffle exec scripts/getBalance.js --network=ropsten --tokenaddr=33D6F5F675c26Ac4C6a76dbf8EA8d2df41dCD2BF --addr=807c8895aCC82A8dcbC76792Ca3Bf46f41012765
```

## 6) Sign the minting message with each owner keypair(note that the nonce must match from above)
```
node scripts/signMintingMessage.js --keyfile=./wallet1 --nonce=0 --amount=1000000
node scripts/signMintingMessage.js --keyfile=./wallet2 --nonce=0 --amount=1000000
node scripts/signMintingMessage.js --keyfile=./wallet3 --nonce=0 --amount=1000000
```

##7  ) Broadcast the minting transaction from the owner account which should recieve the funds:

truffle exec scripts/mint.js --network=ropsten --keyfile=./test.wallet --tokenaddr=0e6a11A859A252CEFd2F1cAA1fCa30fB4C31a56F --message=00000000000000000000000000000000000000000000000000000000001e8492 --sig1=68da7fa5f00a9f2773ccce59f080d2938a72d71811119ed33bd9afcba05976d3619a8356ab59c1fbb147faf1e77b42831a772b767ff57e71079a7dc45eacf5d71c --sig2=a1b21dce1cde8ab2384a0943d610712baa33a51b9a153df7452962ffa691922021eb0c77993fc901577c5b0dcb57576890bf063dcbb8a0b0d9cbdd90a51b6d7f1b --sig3=6f4fdc2ca9c160e3585f8f850ea0fa2ada1604d6bb984fe41a522b01bd49dcfb5435fc74e70e8e19f7005b8caee4f80e8296c942ade66002d6c20e089d0dcc3c1b

## 8 ) Test burning

Setup a custom token on MEW and paste in the ABI from the deployments.

## 8 ) Test transfer(ask Clay to write a transfer script or use a regular wallet depending on how Owner 1 is setup)

Profit!
