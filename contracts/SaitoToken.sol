pragma solidity >=0.6.0 <0.8.0;

import "./lib/openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./lib/openzeppelin/contracts/token/ERC777/ERC777.sol";
//import "./lib/openzeppelin/contracts/access/Ownable.sol";
import "./SaitoOwnerManager.sol";

contract SaitoToken is SaitoOwnerManager, ERC777 {
  uint256 private MAX_SUPPLY = 10000000000;
  address proposedNewOwner;
  uint256 proposedMinting;
  
  struct BurnAuthorization { 
    uint256 amount;
    bytes data;
  }
  
  mapping(address => bool) internal addOwnerAuthorizations;
  mapping(address => bool) internal mintingAuthorizations;
  mapping(address => bool) internal mintTransferAuthorizations; // not going to implement this, probably, instead just mint to the last owner to submit the tx
  mapping(address => BurnAuthorization) internal burnAuthorizations;
  
  constructor (string memory name_, string memory symbol_) public ERC777(name_, symbol_, new address[](0)) {
    addOwner(msg.sender); 
  }
  
  // amount == MAX_SUPPLY + 1 => Revoke new owner authorization
  // amount == MAX_SUPPLY + 2 => Add new owner authorization(propose/approve/add)
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
    //require(burnAuthorizations[msg.sender] != 0);
    require(burnAuthorizations[account].amount == amount);
    
    super.operatorBurn(account, amount, data, operatorData);
    // require(isOperatorFor(_msgSender(), account), "ERC777: caller is not an operator for holder");
    // _burn(account, amount, data, operatorData);
  }
  
  function getBurnAuthorizationAmount(address account) public returns (uint256) {
    return burnAuthorizations[account].amount;
  }
  
  // function getBurnAuthorizationData(address account) public returns (bytes32) {
  //   return burnAuthorizations[account].data;
  // }
  
  function operatorSend(address sender, address recipient, uint256 amount, bytes memory data, bytes memory operatorData) public virtual override {
    require(false);
  }
  
  event BurnAuth(uint256 amount, bytes data);
  
  // function bytesToBytes32(bytes b, uint offset) private pure returns (bytes32) {
  //   bytes32 out;
  // 
  //   for (uint i = 0; i < 32; i++) {
  //     out |= bytes32(b[offset + i] & 0xFF) >> (i * 8);
  //   }
  //   return out;
  // }
}
