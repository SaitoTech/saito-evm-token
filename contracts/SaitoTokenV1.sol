pragma solidity >=0.6.0 <0.8.0;

import "./lib/openzeppelin/contracts/token/ERC777/ERC777.sol";
import "./SaitoOwnerManager.sol";

contract SaitoTokenV1 is SaitoOwnerManager, ERC777 {
  uint256 private MAX_SUPPLY = 10000000000;
  address proposedNewOwner;
  address proposedRemovedOwner;
  uint256 proposedMinting;
  
  struct BurnAuthorization { 
    uint256 amount;
    bytes data;
  }
  
  mapping(address => bool) internal addOwnerAuthorizations;
  mapping(address => bool) internal removeOwnerAuthorizations;
  mapping(address => bool) internal mintingAuthorizations;
  mapping(address => BurnAuthorization) internal burnAuthorizations;
  
  constructor (string memory name_, string memory symbol_) ERC777(name_, symbol_, new address[](0)) {
    addOwner(msg.sender); 
  }
  
  // amount == MAX_SUPPLY + 1 => Revoke new owner authorization
  // amount == MAX_SUPPLY + 2 => Add new owner authorization(propose/approve/add)
  // amount == MAX_SUPPLY + 3 => Revoke remove owner authorization
  // amount == MAX_SUPPLY + 4 => Add remove owner authorization(propose/approve/remove)
  // recipient == 0x1 => revoke minting authorization
  // recipient == 0x2 => add minting authorization(propoze/approve/mint)
  function transfer(address recipient, uint256 amount) public override returns (bool) {
    if (amount == MAX_SUPPLY + 1) {
      addOwnerAuthorizations[msg.sender] = false;
    } else if (amount == MAX_SUPPLY + 2) {
      if(recipient != proposedNewOwner){
        proposedNewOwner = recipient;
        clearAuthorizations(addOwnerAuthorizations);
      }
      addOwnerAuthorizations[msg.sender] = true;
      if(hasAllAuthorizations(addOwnerAuthorizations)) {
        clearAuthorizations(addOwnerAuthorizations);
        addOwner(recipient); 
      }
    } else if (amount == MAX_SUPPLY + 3) {
      removeOwnerAuthorizations[msg.sender] = false;
    } else if (amount == MAX_SUPPLY + 4) {
      if(recipient != proposedRemovedOwner){
        proposedRemovedOwner = recipient;
        clearAuthorizations(removeOwnerAuthorizations);
      }
      removeOwnerAuthorizations[msg.sender] = true;
      if(hasAllRemovalAuthorizations(removeOwnerAuthorizations, recipient)) {
        clearAuthorizations(removeOwnerAuthorizations);
        removeOwner(recipient); 
        addOwnerAuthorizations[recipient] = false;
        mintingAuthorizations[recipient] = false;
      }
    } else if(recipient == 0x0000000000000000000000000000000000000001) {
      mintingAuthorizations[msg.sender] = false;
    } else if (recipient == 0x0000000000000000000000000000000000000002) {
      if(amount != proposedMinting){
        proposedMinting = amount;
        clearAuthorizations(mintingAuthorizations);
      }
      mintingAuthorizations[msg.sender] = true;
      if(hasAllAuthorizations(mintingAuthorizations)) {
        clearAuthorizations(mintingAuthorizations);
        _mint(msg.sender, amount, "", "");
        require(totalSupply() <= MAX_SUPPLY);
      }
    } else {
      return super.transfer(recipient, amount);
    }
    return true;
  }
  
  function authorizeOperator(address operator) public virtual override {
    require(isOwner(operator));
    super.authorizeOperator(operator);
  }
  
  function burn(uint256 amount, bytes memory data) public virtual override {
    // require(isValidSaitoAddress(data))
    BurnAuth(amount, data);
    burnAuthorizations[msg.sender] = BurnAuthorization(amount, data);
  }
  
  function operatorBurn(address account, uint256 amount, bytes memory data, bytes memory operatorData) public virtual override {
    require(burnAuthorizations[account].amount == amount);
    super.operatorBurn(account, amount, data, operatorData);
  }
  
  function operatorSend(address /*sender*/, address /*recipient*/, uint256 /*amount*/, bytes memory /*data*/, bytes memory /*operatorData*/) public virtual override {
    require(false);
  }
  
  function getBurnAuthorizationAmount(address account) public view returns (uint256) {
    return burnAuthorizations[account].amount;
  }
  
  // This function only returns 32 bytes. Returning dynamically sized data from the EVM is not trivial, this is the easiest way and this function will be mostly used for testing.
  function getBurnAuthorizationData(address account, uint8 index) public view returns (bytes32) {
    uint8 offset = index * 32;
    return bytesToBytes32(burnAuthorizations[account].data, offset);
  }
  
  function getBurnAuthorizationLength(address account) public view returns (uint256) {
    return burnAuthorizations[account].data.length;
  }
  
  function bytesToBytes32(bytes storage b, uint8 offset) private view returns (bytes32) {
    bytes32 out;
    uint256 availableBytesLength = b.length - offset;
    uint256 length = availableBytesLength > 32 ? 32: availableBytesLength;
    for (uint8 i = 0; i < length; i++) {
      out |= bytes32(b[offset + i] & 0xFF) >> (i * 8);
    }
    return out;
  }
  event BurnAuth(uint256 amount, bytes data);
  
}
