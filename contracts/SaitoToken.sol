pragma solidity >=0.6.0 <0.8.0;

import "./lib/openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./lib/openzeppelin/contracts/token/ERC777/ERC777.sol";
contract SaitoToken is ERC20 {
  uint256 private INIT_SUPPLY = 10000000000;

  string private _name;
  string private _symbol;
  uint8 private _decimals;
  constructor (string memory name_, string memory symbol_) {
    _name = name_;
    _symbol = symbol_;
    _decimals = 18;
    _mint(msg.sender, INIT_SUPPLY);
  }
}
