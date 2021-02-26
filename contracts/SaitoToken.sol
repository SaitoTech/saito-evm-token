pragma solidity >=0.6.0 <0.8.0;

import "./lib/openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./lib/openzeppelin/contracts/token/ERC777/ERC777.sol";
//import "./lib/openzeppelin/contracts/access/Ownable.sol";
import "./SaitoOwnerManager.sol";

contract SaitoToken is SaitoOwnerManager, ERC777 {
  uint256 private MAX_SUPPLY = 10000000000;
  address proposedNewOwner;
  uint256 proposedMinting;
  
  mapping(address => bool) internal addOwnerAuthorizations;
  mapping(address => bool) internal mintingAuthorizations;
  mapping(address => bool) internal mintTransferAuthorizations; // not going to implement this, probably, instead just mint to the last owner to submit the tx
  
  constructor (string memory name_, string memory symbol_) public ERC777(name_, symbol_, new address[](0)) {
    addOwner(msg.sender); 
  
  }
  function transfer(address recipient, uint256 amount) public override returns (bool) {
    // MAX_SUPPLY + 1 => Revoke new owner authorization
    if (amount == MAX_SUPPLY + 1) {
      addOwnerAuthorizations[msg.sender] = false;
    // MAX_SUPPLY + 2 => Add new owner authorization(propose/approve/add)
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
    // 0x1 => revoke minting authorization
    } else if(recipient == 0x0000000000000000000000000000000000000001) {
      mintingAuthorizations[msg.sender] = false;
    // 0x2 => add minting authorization(propoze/approve/mint)
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
      transfer(recipient, amount);
    }
    return true;
  }
}
