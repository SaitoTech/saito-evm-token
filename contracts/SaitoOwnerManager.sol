pragma solidity >=0.5.0 <0.8.0;

// This contract is a fork of Gnosis OwnerManager with the following changes:
// - setupOwners removed
// - swapOwner removed
// - removedOwner simplified
// - threshold removed(we only want n-of-n)
// - authorization of AddOwner and removeOwner removed and replaced with basic 
//   internal restriction. Authorization of these function is left to the
//   implementer. An example can be seen in SaitoToken.sol.

contract SaitoOwnerManager {

  event AddedOwner(address owner);
  event RemovedOwner(address owner);

  address internal constant SENTINEL_OWNER = address(0x1);
  
  // owners holds a linked-list-like structure rooted AND capped by SENTINEL_OWNER
  mapping(address => address) internal owners;
  uint8 ownerCount;
  function hasAllAuthorizations(mapping(address => bool) storage map) internal view returns (bool)  {
    address[] memory ownersArr = getOwners();
    for (uint i= 0; i < ownersArr.length; i++) {
      if(map[ownersArr[i]] == false) {
        return false;
      }
    }
    return true;
  }
  
  function hasAllRemovalAuthorizations(mapping(address => bool) storage map, address deadOwner) internal view returns (bool)  {
    address[] memory ownersArr = getOwners();
    for (uint i= 0; i < ownersArr.length; i++) {
      if(map[ownersArr[i]] == false && ownersArr[i] != deadOwner) {
        return false;
      }
    }
    return true;
  }
  
  function clearAuthorizations(mapping(address => bool) storage map) internal {
    address[] memory ownersArr = getOwners();
    for (uint i= 0; i < ownersArr.length; i++) {
      map[ownersArr[i]] = false;
    }
  }
  
  function addOwner(address newOwner) internal {
    require(newOwner != address(0) && newOwner != SENTINEL_OWNER, "Invalid owner address provided");
    require(owners[newOwner] == address(0), "Address is already an owner");
    if(owners[SENTINEL_OWNER] == address(0)) {
      owners[newOwner] = SENTINEL_OWNER;
    } else {
      address nextOwner = owners[SENTINEL_OWNER];
      owners[newOwner] = nextOwner;
    }
    owners[SENTINEL_OWNER] = newOwner;
    ownerCount++;
    emit AddedOwner(newOwner);
  }

  function removeOwner(address removedOwner) internal {
    require(removedOwner != address(0) && removedOwner != SENTINEL_OWNER, "Invalid owner address provided");
    address prevOwner = getPrevOwner(removedOwner);
    owners[prevOwner] = owners[removedOwner];
    owners[removedOwner] = address(0);
    ownerCount--;
    emit RemovedOwner(removedOwner);
  }
  
  function getPrevOwner(address owner) internal view returns (address) {
    address prevOwner = owners[SENTINEL_OWNER];
    while(owners[prevOwner] != owner) {
      prevOwner = owners[prevOwner];
    }
    return prevOwner;
  }
  
  function getOwners() public view returns (address[] memory) {
    address[] memory array = new address[](ownerCount);
    uint256 index = 0;
    address currentOwner = owners[SENTINEL_OWNER];
    while(currentOwner != SENTINEL_OWNER) {
      array[index] = currentOwner;
      currentOwner = owners[currentOwner];
      index ++;
    }
    return array;
  }
  function getOwnerCount() public view returns (uint8) {
    return ownerCount;
  }
  
  function isOwner(address owner) public view returns (bool) {
    return owner != SENTINEL_OWNER && owners[owner] != address(0);
  }
}