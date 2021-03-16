We've opted to copy contract library code from Open Zeppelin rather than npm installing those libraries. For justfication of this decision see contracs/lib/openzeppelin/README.md.

Setup:

npm i -g truffle

Usage:

Copy the desired Solidity Contract libraries from Open Zeppelin's github()

Be sure that the solidity/solc versions match. Currently we are using the latest Open Zeppelin contracts which have been deployed to npm which target "pragma solidity >=0.6.0 <0.8.0;".

Choose a solc version which complies with these targets. At this moment the latest is 0.7.6. Configure this in truffle-config.js.

truffle test

truffle compile


Deploying:

1) Generate 3 keypairs for the owners
This stores encrypted wallets at the destination

node scripts/generateKeypair.js --dest=<encryptedKeypairFileLocation>

Paste the addresses of the keypairs into the constructor of the contract.

Deploy the contract:

truffle migrate --keyfile=./test.wallet --network=ropsten --reset

Note the contracts address.

Commit and push the deployed ABI so it will not be lost.(in ./deployments)

Confirm that the nonce is 0:

truffle exec scripts/getNonce.js --network=ropsten --tokenaddr=0e6a11A859A252CEFd2F1cAA1fCa30fB4C31a56F

Sign the minting message with each owner keypair:

node scripts/signMintingMessage.js --keyfile=./test.wallet --nonce=0 --amount=1000000
node scripts/signMintingMessage.js --keyfile=./test.wallet2 --nonce=0 --amount=1000000
node scripts/signMintingMessage.js --keyfile=./test.wallet3 --nonce=0 --amount=1000000

Broadcast the minting transaction from the owner account which should recieve the funds:

truffle exec scripts/mint.js --network=ropsten --keyfile=./test.wallet --tokenaddr=0e6a11A859A252CEFd2F1cAA1fCa30fB4C31a56F --message=00000000000000000000000000000000000000000000000000000000001e8492 --sig1=68da7fa5f00a9f2773ccce59f080d2938a72d71811119ed33bd9afcba05976d3619a8356ab59c1fbb147faf1e77b42831a772b767ff57e71079a7dc45eacf5d71c --sig2=a1b21dce1cde8ab2384a0943d610712baa33a51b9a153df7452962ffa691922021eb0c77993fc901577c5b0dcb57576890bf063dcbb8a0b0d9cbdd90a51b6d7f1b --sig3=6f4fdc2ca9c160e3585f8f850ea0fa2ada1604d6bb984fe41a522b01bd49dcfb5435fc74e70e8e19f7005b8caee4f80e8296c942ade66002d6c20e089d0dcc3c1b