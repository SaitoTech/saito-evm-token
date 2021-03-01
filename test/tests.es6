'use strict';
const SaitoToken = artifacts.require('SaitoToken.sol');

const { expectEvent, singletons, constants } = require('@openzeppelin/test-helpers');
function arrayContains(array, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] == value) {
      return true;
    }
  }
  return false;
}
contract('Test Contracts', (accounts) => {
  let owner1  = accounts[0];
  let owner2  = accounts[3];
  let owner3  = accounts[4];
  let owner4  = accounts[3];
  let owner5  = accounts[4];
  let registryFunder = accounts[6];
  let operator  = accounts[7];
  let user1  = accounts[8];
  let user2  = accounts[9];

  let saitoToken, erc1820;
  let fakeUser = "0x0000000000000000000000000000000000000000";
  let initSupply = 1000000;
  let maxSupply = 10000000000;
  let addOwnerKey = 10000000002;
  let removeOwnerKey = 10000000001;
  let addMintAuthKey = "0x0000000000000000000000000000000000000002";
  let removeMintAuthKey = "0x0000000000000000000000000000000000000001";
  
  let saitoTokenName = "Saito Token";
  let saitoTokenTicker = "STT";
  describe('SaitoToken Tests', function() {
    // TODO send()
    // operatorSend()
    // decimals
    // increaseAllowance
    // decreaseAllowance
    // 
    
    before(async() => {
      erc1820 = await singletons.ERC1820Registry(registryFunder);
      saitoToken = await SaitoToken.new(saitoTokenName, saitoTokenTicker, { from: owner1 });
    });
    
    it("saitoToken granularity is 1", async function() {
      let granularity = await saitoToken.granularity.call();
      assert(granularity == 1);
    });
    
    it("saitoToken defaultOperators is empty", async function() {
      let defaultOperators = await saitoToken.defaultOperators.call();
      assert.equal(defaultOperators.length, 0, "defaultOperators should be empty");
    });
    
    it("saitoToken name is set", async function() {
      let name = await saitoToken.name.call();
      assert.equal(name, saitoTokenName, "name should be set");
    });
    
    it("saitoToken ticker is set", async function() {
      let ticker = await saitoToken.symbol.call();
      assert.equal(ticker, saitoTokenTicker, "ticker should be set");
    });
    
    it("saitoToken initial supply is 0", async function() {
      let totalSupply = await saitoToken.totalSupply.call();
      assert.equal(totalSupply.toNumber(), 0);
    });
    
    it("saitoToken creator is only owner", async function() {
      let owners = await saitoToken.getOwners.call();
      assert(owners.length == 1);
      assert(owners[0] == owner1);
    });
    
    it("saitoToken one owner can mint", async function() {
      await saitoToken.transfer(addMintAuthKey, initSupply, {from: owner1});
      let totalSupply = await saitoToken.totalSupply.call();
      assert.equal(totalSupply.toNumber(), initSupply, "expected supply of " + initSupply);
    });
    
    it("saitoToken cannot be minted by non-owner", async function() {
      await saitoToken.transfer(addMintAuthKey, initSupply, {from: user1});
      let totalSupply = await saitoToken.totalSupply.call();
      assert.equal(totalSupply.toNumber(), initSupply, "expected supply of " + initSupply);
    });
    
    it("saitoToken cannot mint more than 10,000,000,000", async function() {
      let totalSupply = await saitoToken.totalSupply.call();
      await await saitoToken.transfer(addMintAuthKey, maxSupply - totalSupply.toNumber() + 1, {from: owner1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.equal(error.message, "Returned error: VM Exception while processing transaction: revert", "Expected unapproved revert");
      });
    });
    
    it("saitoToken owner should have total supply", async function() {
      let totalSupply = await saitoToken.totalSupply.call();
      let ownerBalance = await saitoToken.balanceOf(owner1);
      assert.equal(ownerBalance.toNumber(), totalSupply.toNumber(), "expected owner to have entire supply");
    });
    
    it("saitoToken owner can add another owner", async function() {
      await saitoToken.transfer(owner2, 10000000002, {from: owner1});
      let owners = await saitoToken.getOwners.call();
      assert(owners.length == 2, "length is 2");
      assert(arrayContains(owners, owner1),"has owner 1");
      assert(arrayContains(owners, owner2),"has owner 2");
    });
    
    it("saitoToken cannot be minted by just one owner", async function() {
      await saitoToken.transfer(addMintAuthKey, initSupply, {from: owner1});
      let totalSupply = await saitoToken.totalSupply.call();
      assert.equal(totalSupply.toNumber(), initSupply, "expected supply of " + initSupply);
    });
    
    it("saitoToken can be minted by owners", async function() {
      await saitoToken.transfer(addMintAuthKey, initSupply, {from: owner2});
      let totalSupply = await saitoToken.totalSupply.call();
      assert.equal(totalSupply.toNumber(), initSupply*2, "expected supply of " + initSupply);
      
      let owner1Balance = await saitoToken.balanceOf(owner1);
      let owner2Balance = await saitoToken.balanceOf(owner2);
      assert.equal(owner1Balance.toNumber(), initSupply, "expected half of supply for owner 1");
      assert.equal(owner2Balance.toNumber(), initSupply, "expected half of supply for owner 2");
    });
    
    it("saitoToken owners can revoke minting auth", async function() {
      await saitoToken.transfer(addMintAuthKey, initSupply, {from: owner1});
      await saitoToken.transfer(removeMintAuthKey, 0, {from: owner1});
      await saitoToken.transfer(addMintAuthKey, initSupply, {from: owner2});
      let totalSupply = await saitoToken.totalSupply.call();
      assert.equal(totalSupply.toNumber(), initSupply*2, "expected supply of " + initSupply);
    });
    
    it("saitoToken one owner cannot add another owner alone ", async function() {
      await saitoToken.transfer(owner3, 10000000002, {from: owner1});
      let owners = await saitoToken.getOwners.call();
      assert(owners.length == 2, "length is 2");
      assert(arrayContains(owners, owner1),"has owner 1");
      assert(arrayContains(owners, owner2),"has owner 2");
    });
    
    it("saitoToken two owners can add a third", async function() {
      await saitoToken.transfer(owner3, 10000000002, {from: owner2});
      let owners = await saitoToken.getOwners.call();
      assert(owners.length == 3, "length is 3");
      assert(arrayContains(owners, owner1),"has owner 1");
      assert(arrayContains(owners, owner2),"has owner 2");
      assert(arrayContains(owners, owner3),"has owner 3");
    });
    
    it("saitoToken can be transferred", async function() {
      let ownerBalance = await saitoToken.balanceOf(owner1);
      let user1Balance = await saitoToken.balanceOf(user1);
      await saitoToken.transfer(user1, 1000, {from: owner1});
      let newOwnerBalance = await saitoToken.balanceOf(owner1);
      let newUser1Balance = await saitoToken.balanceOf(user1);
      assert.equal(newOwnerBalance.toNumber(), ownerBalance.toNumber() - 1000, "");
      assert.equal(newUser1Balance.toNumber(), user1Balance.toNumber() + 1000, "");
    });
    
    it("saitoToken can be transferred through allowance", async function() {
      let ownerBalance = await saitoToken.balanceOf(owner2);
      let user2Balance = await saitoToken.balanceOf(user2);
      let status = await saitoToken.approve(user1, 2, {from: owner2});
      let allowance = await saitoToken.allowance(owner2, user1, {from: owner2});
      assert.equal(allowance.toNumber(), 2, "");
      status = await saitoToken.transferFrom(owner2, user2, 1, {from: user1});
      let newOwnerBalance = await saitoToken.balanceOf(owner2);
      let newUser2Balance = await saitoToken.balanceOf(user2);
      assert.equal(newOwnerBalance.toNumber(), ownerBalance.toNumber() - 1, "");
      assert.equal(newUser2Balance.toNumber(), user2Balance.toNumber() + 1, "");
    });
    
    it("saitoToken owners can be assigned as operators", async function() {
      await saitoToken.authorizeOperator(owner1, {from: user1});
      let result = await saitoToken.isOperatorFor(owner1, user1);
      assert(result, "owner1 to be operator for user1");
    });
    
    it("saitoToken non-owners cannot be assigned as operators", async function() {
      await saitoToken.authorizeOperator(user2, {from: user1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.equal(error.message, "Returned error: VM Exception while processing transaction: revert", "Expected unapproved revert");
      });
    });
    
    it("saitoToken burn publishes data as event", async function() {
      await saitoToken.authorizeOperator(owner1, {from: user1});
      await saitoToken.burn(100, "0xBEEF", {from: user1});
      let burnAuthorizationAmount = await saitoToken.getBurnAuthorizationAmount.call(user1);
      //let burnAuthorizationData = await saitoToken.getBurnAuthorizationData(user1);
      console.log(burnAuthorizationAmount.toNumber());
      //console.log(burnAuthorizationData);
      // assert.equal(txResponse.logs[0].event, "BurnAuth", "expected BurnAuth event");
      // assert.equal(txResponse.logs[0].args.amount.toNumber(), 100, "expected 100 coins authorized");
      // assert.equal(txResponse.logs[0].args.data, "0xbeef", "where's the beef?");
    });
    
    it("saitoToken operator can burn", async function() {
      let txResponse = await saitoToken.operatorBurn(user1, 100, "0xbeef", "0xfeef", {from: owner1});
      let totalSupply = await saitoToken.totalSupply.call();
      assert.equal(txResponse.logs[0].event, "Burned", "expected BurnAuth event");
      assert.equal(txResponse.logs[0].args.amount.toNumber(), 100, "expected 100 coins authorized");
      assert.equal(txResponse.logs[0].args.data, "0xbeef", "expected data to beef");
      assert.equal(txResponse.logs[0].args.operatorData, "0xfeef", "expected operator data to be feef");
      assert.equal(totalSupply.toNumber(), 2*initSupply - 100, "expected supply of " + initSupply);
    });
    
    it("saitoToken non-operators cannot burn", async function() {
      let txResponse = await saitoToken.operatorBurn(user1, 100, "0x0", "0x0", {from: user2}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.equal(error.message, "Returned error: VM Exception while processing transaction: revert ERC777: caller is not an operator for holder -- Reason given: ERC777: caller is not an operator for holder.", "Expected unapproved revert");
      });
    });
    
    it("saitoToken operator cannot burn more than user's balance", async function() {
      let txResponse = await saitoToken.operatorBurn(user1, 1001, "0xbeef", "0xfeef", {from: owner1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.equal(error.message, "Returned error: VM Exception while processing transaction: revert");
      });
    });
    
    it("saitoToken can revokeOperator", async function() {
      await saitoToken.revokeOperator(owner1, {from: user1});
      let txResponse = await saitoToken.operatorBurn(user1, 100, "0x0", "0x0", {from: owner1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.equal(error.message, "Returned error: VM Exception while processing transaction: revert ERC777: caller is not an operator for holder -- Reason given: ERC777: caller is not an operator for holder.", "Expected unapproved revert");
      });
    });
  });
});
