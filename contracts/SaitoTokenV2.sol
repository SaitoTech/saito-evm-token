pragma solidity >=0.6.0 <0.8.0;

import "./lib/openzeppelin/contracts/token/ERC777/ERC777.sol";

contract SaitoTokenV2 is ERC777 {
  uint256 private MAX_SUPPLY = 10000000000;
  // address proposedNewOwner;
  // address proposedRemovedOwner;
  address owner1;
  address owner2;
  address owner3;
  
  constructor (string memory name_, string memory symbol_, address owner1_, address owner2_, address owner3_) ERC777(name_, symbol_, new address[](0)) {
    owner1 = owner1_;
    owner2 = owner2_;
    owner3 = owner3_;
  }
  
  function isOwner() public view returns (bool) {
    return msg.sender == owner1 || msg.sender == owner2 || msg.sender == owner3;
  }
  /************* Begin minting authorization V1 *************/
  uint256 proposedMinting;
  //mapping(address => bool) internal mintingAuthorizations;
  bool owner1MintingAuth = false;
  bool owner2MintingAuth = false;
  bool owner3MintingAuth = false;
  function clearMintingAuthorizations() internal {
    owner1MintingAuth = false;
    owner2MintingAuth = false;
    owner3MintingAuth = false;
  }
  function hasAllMintingAuthorizations() internal returns (bool) {
    return owner1MintingAuth && owner2MintingAuth && owner3MintingAuth;
  }
  function authorizeMinting(uint256 amount) public virtual {
    require(totalSupply() + amount <= MAX_SUPPLY);
    require(isOwner());
    if(amount != proposedMinting){
      proposedMinting = amount;
      clearMintingAuthorizations();
    }
    if(msg.sender == owner1){
      owner1MintingAuth = true;
    }
    if(msg.sender == owner2){
      owner2MintingAuth = true;
    }
    if(msg.sender == owner3){
      owner3MintingAuth = true;
    }
    if(hasAllMintingAuthorizations()) {
      clearMintingAuthorizations();
      _mint(msg.sender, amount, "", "");
      require(totalSupply() <= MAX_SUPPLY);
    }
  }
  function deauthorizeMinting() public virtual {
    require(isOwner());
    if(msg.sender == owner1){
      owner1MintingAuth = false;
    }
    if(msg.sender == owner2){
      owner2MintingAuth = false;
    }
    if(msg.sender == owner3){
      owner3MintingAuth = false;
    }
  }
  /************* End minting authorization V1 *************/
  
  /************* Begin minting authorization V2 *************/
  function mintReplayable(bytes32 signedMessage, uint8 sigV1, bytes32 sigR1, bytes32 sigS1, uint8 sigV2, bytes32 sigR2, bytes32 sigS2, uint8 sigV3, bytes32 sigR3, bytes32 sigS3) public virtual returns(bool) {
    // without a nonce, an owner could replay this...
    require(isOwner());
    require(ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", signedMessage)), sigV1, sigR1, sigS1) == owner1, "Not approved by owner1");
    require(ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", signedMessage)), sigV2, sigR2, sigS2) == owner2, "Not approved by owner2");
    require(ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", signedMessage)), sigV3, sigR3, sigS3) == owner3, "Not approved by owner3");
    uint256 amount = uint256(signedMessage) & 2**32-1;
    require(totalSupply() + amount <= MAX_SUPPLY);
    _mint(msg.sender, amount, "", "");
  }
  /************* End minting authorization V2 *************/
  
  /************* Begin minting authorization V3 **************/
  uint32 miningNonce = 0;
  function getMiningNonce() public view returns(uint32) {
    return miningNonce;
  }  
  function mint(bytes32 signedMessage, uint8 sigV1, bytes32 sigR1, bytes32 sigS1, uint8 sigV2, bytes32 sigR2, bytes32 sigS2, uint8 sigV3, bytes32 sigR3, bytes32 sigS3) public virtual returns(bool) {
    require(isOwner());
    require(ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", signedMessage)), sigV1, sigR1, sigS1) == owner1, "Not approved by owner1");
    require(ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", signedMessage)), sigV2, sigR2, sigS2) == owner2, "Not approved by owner2");
    require(ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", signedMessage)), sigV3, sigR3, sigS3) == owner3, "Not approved by owner3");
    uint256 rawData = uint256(signedMessage) & (2**224-1);
    uint256 amount = uint256(rawData & (2**32-1));
    rawData = rawData / (2**32);
    uint32 nonce = uint32(rawData & (2**32-1));
    require(nonce == miningNonce);
    require(totalSupply() + amount <= MAX_SUPPLY);
    miningNonce += 1;
    _mint(msg.sender, amount, "", "");
  }
  /************* End minting authorization V3 *************/
  
  function authorizeOperator(address /*operator*/) public virtual override {
    require(false);
  }
  function revokeOperator(address /*operator*/) public virtual override  {
    require(false);
  }
  function operatorSend(address sender, address recipient, uint256 amount, bytes memory data, bytes memory operatorData) public virtual override {
    require(false);
  }
  function operatorBurn(address account, uint256 amount, bytes memory data, bytes memory operatorData) public virtual override {
    require(false);
  }
  
}
