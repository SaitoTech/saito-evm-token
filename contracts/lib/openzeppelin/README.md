Open Zeppelin is a tool suite that include a CLI and scripts for deploying. However, all we really want at this point is the contracts included in @OpenZeppelin/contracts.

Open Zeppelin often has solc version mismatch issues between the CLI and the contracts library(https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/).

The reason for this is that solc is not an npm package, it is managed by truffle in truffle-config.js. For this reason, some people recommend to use npm install --save-exact to avoid these issues, however the root problem is that solc is not managed by npm.

Additionally, at this moment, npm install @openzeppelin/contracts ERC20 targets "pragma solidity >=0.6.0 <0.8.0;". However, at head, it targets "pragma solidity ^0.8.0;".

Because of these reasons and because we don't want to use Open Zeppelin CLI, we've instead opted to simply copy the contracts here directly from the OZ repo(https://github.com/OpenZeppelin/openzeppelin-contracts.git).

Additionally, the docs recommend "npx oz compile --solc-version 0.5.14" which conflicts with the latest contracts deployed to npm(https://docs.openzeppelin.com/cli/2.8/compiling).

Additionally, the ERC20 contract distributed by OZ had the following error when compiling with 0.7.6:

```
> Compilation warnings encountered:

    /home/clay/projects/saito-erc20/contracts/SaitoERC20.sol: Warning: SPDX license identifier not provided in source file. Before publishing, consider adding a comment containing "SPDX-License-Identifier: <SPDX-License>" to each source file. Use "SPDX-L
icense-Identifier: UNLICENSED" for non-open-source code. Please see https://spdx.org for more information.
,/home/clay/projects/saito-erc20/contracts/lib/openzeppelin/contracts/token/ERC20/ERC20.sol:55:5: Warning: Visibility for constructor is ignored. If you want the contract to be non-deployable, making it "abstract" is sufficient.
    constructor (string memory name_, string memory symbol_) public {
    ^ (Relevant source part starts here and spans across multiple lines).

/home/clay/projects/saito-erc20/contracts/SaitoERC20.sol:10:1: TypeError: Contract "TutorialToken" should be marked as abstract.
contract TutorialToken is ERC20 {
^ (Relevant source part starts here and spans across multiple lines).
/home/clay/projects/saito-erc20/contracts/lib/openzeppelin/contracts/token/ERC20/ERC20.sol:55:5: Missing implementation: 
    constructor (string memory name_, string memory symbol_) public {
    ^ (Relevant source part starts here and spans across multiple lines).
```