# Setup:

npm i -g truffle

# Usage:

truffle test

truffle compile

# Deploying:

### 1) Generate 3 keypairs for the owners

```
node scripts/generateKeypair.js --dest=<fileLocation>
```

This stores encrypted wallets at the destination

### 2) Paste the addresses of the keypairs into the constructor of the contract

Replace these lines:

```
owner1 = 0x1111222233334444555566667777888899991111;
owner2 = 0x1111222233334444555566667777888899992222;
owner3 = 0x1111222233334444555566667777888899993333;
```

### 3) Deploy the contract

```
truffle migrate --network=ropsten --reset
```

Note the contracts address. Upon completion, this will save the contract's ABIs to the deployments directory.

### 4) Check that things look okay on etherscan(and etherchain and ethplorer)

```
https://etherscan.io/address/<tokenaddress>
and 
https://etherscan.io/token/<tokenaddress>
```

### 5) Commit the ABIs to github(in deployments directory)

```
git add deployments/<networkid>-<tokenaddress> // location given above after deployment/migration script
git commit
git push
```

### 6) Get the contract's minting nonce

```
truffle exec scripts/getMintingNonce.js --network=ropsten --tokenaddr=<tokenaddress>
```

### 7) Sign the minting message with each owner keypair(note that the nonce must match from above)

```
node scripts/signMintingMessage.js --keyfile=<fileLocation> --nonce=0 --amount=1000000
node scripts/signMintingMessage.js --keyfile=<fileLocation> --nonce=0 --amount=1000000
node scripts/signMintingMessage.js --keyfile=<fileLocation> --nonce=0 --amount=1000000
```

### 8) Get the ETH tx nonce(getTransactionCount) for owner 1(requires connection to mainnet)
```
truffle exec scripts/getETHNonce.js --network=ropsten --addr=<address>
```


# Burning on MyEtherWallet

### 1) Get the ABI for the appropriate contract 

```
truffle exec scripts/getABI.js --network=ropsten --tokenaddr=<tokenaddress> | xclip -selection clipboard -i
```

### 2) On MEW navigate to Contract -> Interact with Contracts

### 3) Paste in the contract address and ABI

### 4) Find the Burn function in the dropdown

### 5) Enter the amount you wish to burn in SaitoWei. i.e. multiply by 10^18(e.g. 1000000000000000000 will burn 1 token)

### 6) Enter your Saito Address in hex into the data field

Saito addresses, like Bitcoin, are base58 encoded. Find a base58 to hex converter and use that.

### 7) Leave the "Value in ETH" field empty

### 8) Click the Write button

### 9) Mint
```
truffle exec scripts/mint.js --network=ropsten --keyfile=<fileLocation> --tokenaddr=<tokenaddress> --message=00000000000000000000000000000000000000000000000000000000001e8492 --sig1=68da7fa5f00a9f2773ccce59f080d2938a72d71811119ed33bd9afcba05976d3619a8356ab59c1fbb147faf1e77b42831a772b767ff57e71079a7dc45eacf5d71c --sig2=a1b21dce1cde8ab2384a0943d610712baa33a51b9a153df7452962ffa691922021eb0c77993fc901577c5b0dcb57576890bf063dcbb8a0b0d9cbdd90a51b6d7f1b --sig3=6f4fdc2ca9c160e3585f8f850ea0fa2ada1604d6bb984fe41a522b01bd49dcfb5435fc74e70e8e19f7005b8caee4f80e8296c942ade66002d6c20e089d0dcc3c1b
```

### 9) Transfer
```
truffle exec scripts/transferSaito.js --network=ropsten --keyfile=<fileLocation> --tokenaddr=<tokenaddress> --to=<destination> --amount=<amount> --gasprice=<gaspriceinwei>
```

# Other scripts

### Transfer ETH

```
truffle exec scripts/transferEth.js --network=ropsten --keyfile=<fileLocation> --tokenaddr=<tokenaddress> --to=<destination> --amount=<amount> --gasprice=<gaspriceinwei>
```

### Get SAITO Balance
```
truffle exec scripts/getBalance.js --network=ropsten --tokenaddr=<tokenaddress> --addr=<holderaddress>
```

### Mint via a cold wallet
```
node scripts/mintRaw.js --network=ropsten --gasprice=3000000000 --ethnonce=42 --keyfile=<fileLocation> --tokenaddr=<tokenaddress> --message=00000000000000000000000000000002000000000000d3c21bcecceda1000000 --sig1=4b1f413c0d979508a59848f1559feddd051ab5fb5f50253c0d11cf317e85fb4732e8a2c62b52c70f53fd7469f14192dd7bc4f25f5635a00adc7626b6e22cf2b11c --sig2=28243920df7e5f0674cf092fcc70afbcad2502d498c3e867be74ec0ff3ec03526dc1976ec14ef1d8fb1dd99d247fcfdc37103a0da3faae3743dc7b662b2b54d61b --sig3=689ff414ce044ee4c4a58a5e0880b2ec3c9bc66ffd9fdde89c7f9a1cd031119f733349da5727949c3f5bda958b7f20dae236f6d829b74093535551a4f5dfa1431b
```

Then

```
truffle exec scripts/sendRaw.js --network=ropsten --serializedtx='{"type":"Buffer","data":[249,1,171,41,133,4,169,228,203,16,131,12,53,0,148,209,59,190,172,99,229,165,228,41,156,220,168,52,50,100,210
,97,233,234,39,128,185,1,68,14,118,199,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,84,180,11,31,133,43,218,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,28,43,255,133,44,38,250,51,238,60,109,244,105,24,225,80,139,108,84,12,29,23
2,142,208,52,226,127,138,160,64,144,205,0,9,165,126,114,30,141,58,62,7,75,183,32,248,254,206,173,37,145,130,161,90,232,105,235,214,238,80,123,131,87,60,102,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,28,156,232,57,7,183,162,179,241,68,5
1,233,13,3,131,11,238,171,37,173,184,63,221,37,162,16,67,36,80,115,1,150,73,45,227,177,87,154,22,241,78,8,200,47,194,143,123,11,72,96,244,59,131,18,28,9,57,187,72,164,149,134,116,146,149,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,27,12
9,108,8,192,78,37,6,117,98,176,14,163,11,95,138,24,174,213,89,182,130,242,9,144,55,186,25,226,155,7,213,237,41,221,131,231,67,185,119,60,153,87,144,111,96,61,17,174,12,1,235,52,166,83,54,228,181,21,121,191,104,241,201,99,41,160,196,167,86,89,253,124,23,1
16,169,127,31,131,74,84,8,216,130,157,54,62,218,94,49,41,90,78,193,234,146,103,37,242,160,112,91,51,202,248,192,25,203,164,183,210,42,171,136,126,93,0,50,255,122,247,242,114,196,204,158,113,91,162,146,104,11]}'
```

### Get truffle account addresses
Truffle creates addresses for your use for each network. Account 1 will need to be funded before deploying on mainnet.

```
truffle exec scripts/getTruffleAccount.js --network=ropsten
```

### Get the address of an encrypted wallet

(you could also just cat the file)

```
node scripts/getAddress.js --keyfile=<fileLocation>
```

Can also take a private key, useful for development/testing:

```
node scripts/getAddress.js --privkey=<key>
```

### Get private key from an encrypted wallet... Do not use this. Useful for testing only.

```
node scripts/getPrivateKey.js --keyfile=<fileLocation>
```
or, to get keys from truffle account[0],
```
truffle exec scripts/getTrufflePrivateKey.js --network=ropsten
```

### Get token's total supply

```
truffle exec scripts/getTotalSupply.js --network=ropsten --tokenaddr=d13Bbeac63E5A5E4299CdCa8343264D261E9eA27
```

