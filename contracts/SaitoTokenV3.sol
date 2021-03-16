pragma solidity >=0.6.0 <0.8.0;

import "./lib/openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SaitoTokenV3 is ERC20 {
  uint256 private MAX_SUPPLY = 10000000000 * (2 ** 18);
  address owner1;
  address owner2;
  address owner3;
  
  constructor (string memory name_, string memory symbol_) ERC20(name_, symbol_) {
    // owner1 = 0x807c8895aCC82A8dcbC76792Ca3Bf46f41012765;
    // owner2 = 0x7B87875921225B24CdcDf14f3cbb4E397F4CDfa6;
    // owner3 = 0x1561DdEcfA7d9fe2a4D8f7890fcC324961dEc501;
    owner1 = 0x663F3bC24091963934d0a486245C1DB7F6B9ac0E;
    owner2 = 0x8Ef464b8D48e3Be1641ed6b72D060b51870B1178;
    owner3 = 0x7b7A2322F4AC525Ed61Fa19eDe17e929EB6b1bd9;

  }
  function isOwner() public view returns (bool) {
    return msg.sender == owner1 || msg.sender == owner2 || msg.sender == owner3;
  }
  
  function incrementNonce() public virtual {
    require(isOwner(), "Only owners can increment the nonce");
    miningNonce++;
  }
  
  /************* Begin minting authorization V2 **************/
  uint32 miningNonce = 0;
  function getMiningNonce() public view returns(uint32) {
    return miningNonce;
  }  
  function mint(bytes32 signedMessage, uint8 sigV1, bytes32 sigR1, bytes32 sigS1, uint8 sigV2, bytes32 sigR2, bytes32 sigS2, uint8 sigV3, bytes32 sigR3, bytes32 sigS3) public virtual {
    require(isOwner());
    require(ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", signedMessage)), sigV1, sigR1, sigS1) == owner1, "Not approved by owner1");
    require(ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", signedMessage)), sigV2, sigR2, sigS2) == owner2, "Not approved by owner2");
    require(ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", signedMessage)), sigV3, sigR3, sigS3) == owner3, "Not approved by owner3");
    uint256 rawData = uint256(signedMessage) & (2**96-1);
    uint256 amount = uint256(rawData & (2**64-1));
    rawData = rawData / (2**64);
    uint32 nonce = uint32(rawData & (2**32-1));
    require(nonce == miningNonce);
    require(totalSupply() + amount <= MAX_SUPPLY);
    miningNonce += 1;
    _mint(msg.sender, amount);
    emit Minted(msg.sender, amount);
  }
  /************* End minting authorization V2 *************/
  
  function burn(uint256 amount, bytes memory data) public virtual {
    super._burn(msg.sender, amount);
    emit Burned(msg.sender, amount, data);
  }
  
  event Minted(address indexed to, uint256 amount);
  event Burned(address indexed from, uint256 amount, bytes data);
}
