We've opted to copy contract library code from Open Zeppelin rather than npm installing those libraries. For justfication of this decision see contracs/lib/openzeppelin/README.md.

Setup:

npm i -g truffle

Usage:

Copy the desired Solidity Contract libraries from Open Zeppelin's github()

Be sure that the solidity/solc versions match. Currently we are using the latest Open Zeppelin contracts which have been deployed to npm which target "pragma solidity >=0.6.0 <0.8.0;".

Choose a solc version which complies with these targets. At this moment the latest is 0.7.6. Configure this in truffle-config.js.

truffle test

truffle compile
