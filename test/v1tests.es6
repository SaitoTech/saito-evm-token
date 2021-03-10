'use strict';
const SaitoTokenV1 = artifacts.require('SaitoTokenV1.sol');

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
  let owner2  = accounts[1];
  let owner3  = accounts[2];
  let owner4  = accounts[3];
  let owner5  = accounts[4];
  let registryFunder = accounts[5];
  let operator  = accounts[6];
  let user1  = accounts[7];
  let user2  = accounts[8];

  let saitoTokenV1, erc1820;
  let fakeUser = "0x0000000000000000000000000000000000000000";
  let initSupply = 1000000;
  let maxSupply = 10000000000;
  let addOwnerKey = 10000000002;
  let removeOwnerKey = 10000000001;
  let addMintAuthKey = "0x0000000000000000000000000000000000000002";
  let removeMintAuthKey = "0x0000000000000000000000000000000000000001";
  
  let saitoTokenV1Name = "Saito Token";
  let saitoTokenV1Ticker = "STT";
  describe('SaitoTokenV1 Tests', function() {
    
    before(async() => {
      erc1820 = await singletons.ERC1820Registry(registryFunder);
      saitoTokenV1 = await SaitoTokenV1.new(saitoTokenV1Name, saitoTokenV1Ticker, { from: owner1 });
    });
    
    it("saitoTokenV1 granularity is 1", async function() {
      let granularity = await saitoTokenV1.granularity.call();
      assert(granularity == 1);
    });
    
    it("saitoTokenV1 decimals is 18", async function() {
      let decimals = await saitoTokenV1.decimals.call();
      assert(decimals == 18);
    });
    
    it("saitoTokenV1 defaultOperators is empty", async function() {
      let defaultOperators = await saitoTokenV1.defaultOperators.call();
      assert.equal(defaultOperators.length, 0, "defaultOperators should be empty");
    });
    
    it("saitoTokenV1 name is set", async function() {
      let name = await saitoTokenV1.name.call();
      assert.equal(name, saitoTokenV1Name, "name should be set");
    });
    
    it("saitoTokenV1 ticker is set", async function() {
      let ticker = await saitoTokenV1.symbol.call();
      assert.equal(ticker, saitoTokenV1Ticker, "ticker should be set");
    });
    
    it("saitoTokenV1 initial supply is 0", async function() {
      let totalSupply = await saitoTokenV1.totalSupply.call();
      assert.equal(totalSupply.toNumber(), 0);
    });
    
    it("saitoTokenV1 creator is only owner", async function() {
      let owners = await saitoTokenV1.getOwners.call();
      assert(owners.length == 1);
      assert(owners[0] == owner1);
    });
    
    it("saitoTokenV1 one owner can mint", async function() {
      await saitoTokenV1.transfer(addMintAuthKey, initSupply, {from: owner1});
      let totalSupply = await saitoTokenV1.totalSupply.call();
      assert.equal(totalSupply.toNumber(), initSupply, "expected supply of " + initSupply);
    });
    
    it("saitoTokenV1 cannot be minted by non-owner", async function() {
      await saitoTokenV1.transfer(addMintAuthKey, initSupply, {from: user1});
      let totalSupply = await saitoTokenV1.totalSupply.call();
      assert.equal(totalSupply.toNumber(), initSupply, "expected supply of " + initSupply);
    });
    
    it("saitoTokenV1 cannot mint more than 10,000,000,000", async function() {
      let totalSupply = await saitoTokenV1.totalSupply.call();
      await saitoTokenV1.transfer(addMintAuthKey, maxSupply - totalSupply.toNumber() + 1, {from: owner1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Error: Revert or exceptional halt", "Returned error: VM Exception while processing transaction: revert"], "Expected unapproved revert")
      });
    });
    
    it("saitoTokenV1 owner should have total supply", async function() {
      let totalSupply = await saitoTokenV1.totalSupply.call();
      let ownerBalance = await saitoTokenV1.balanceOf(owner1);
      assert.equal(ownerBalance.toNumber(), totalSupply.toNumber(), "expected owner to have entire supply");
    });
    
    it("saitoTokenV1 owner can add another owner", async function() {
      await saitoTokenV1.transfer(owner2, 10000000002, {from: owner1});
      let owners = await saitoTokenV1.getOwners.call();
      assert(owners.length == 2, "length is 2");
      assert(arrayContains(owners, owner1),"has owner 1");
      assert(arrayContains(owners, owner2),"has owner 2");
    });
    
    it("saitoTokenV1 cannot be minted by just one owner", async function() {
      await saitoTokenV1.transfer(addMintAuthKey, initSupply, {from: owner1});
      let totalSupply = await saitoTokenV1.totalSupply.call();
      assert.equal(totalSupply.toNumber(), initSupply, "expected supply of " + initSupply);
    });
    
    it("saitoTokenV1 can be minted by owners", async function() {
      await saitoTokenV1.transfer(addMintAuthKey, initSupply, {from: owner2});
      let totalSupply = await saitoTokenV1.totalSupply.call();
      assert.equal(totalSupply.toNumber(), initSupply*2, "expected supply of " + initSupply);
      let owner1Balance = await saitoTokenV1.balanceOf(owner1);
      let owner2Balance = await saitoTokenV1.balanceOf(owner2);
      assert.equal(owner1Balance.toNumber(), initSupply, "expected half of supply for owner 1");
      assert.equal(owner2Balance.toNumber(), initSupply, "expected half of supply for owner 2");
    });
    
    it("saitoTokenV1 owners can revoke minting auth", async function() {
      await saitoTokenV1.transfer(addMintAuthKey, initSupply, {from: owner1});
      await saitoTokenV1.transfer(removeMintAuthKey, 0, {from: owner1});
      await saitoTokenV1.transfer(addMintAuthKey, initSupply, {from: owner2});
      let totalSupply = await saitoTokenV1.totalSupply.call();
      assert.equal(totalSupply.toNumber(), initSupply*2, "expected supply of " + initSupply);
    });
    
    it("saitoTokenV1 one owner cannot add another owner alone ", async function() {
      await saitoTokenV1.transfer(owner3, 10000000002, {from: owner1});
      let owners = await saitoTokenV1.getOwners.call();
      assert(owners.length == 2, "length is 2");
      assert(arrayContains(owners, owner1),"has owner 1");
      assert(arrayContains(owners, owner2),"has owner 2");
    });
    
    it("saitoTokenV1 two owners can add a third", async function() {
      let txResponse = await saitoTokenV1.transfer(owner3, 10000000002, {from: owner2});
      assert.equal(txResponse.logs[0].event, "AddedOwner", "expected AddedOwner event");
      assert.equal(txResponse.logs[0].args.owner, owner3, "expected owner 3 added");
      let owners = await saitoTokenV1.getOwners.call();
      assert(owners.length == 3, "length is 3");
      assert(arrayContains(owners, owner1),"has owner 1");
      assert(arrayContains(owners, owner2),"has owner 2");
      assert(arrayContains(owners, owner3),"has owner 3");
    
    });
    
    it("saitoTokenV1 three owners can remove a fourth", async function() {
      await saitoTokenV1.transfer(owner4, 10000000002, {from: owner1});
      await saitoTokenV1.transfer(owner4, 10000000002, {from: owner2});
      await saitoTokenV1.transfer(owner4, 10000000002, {from: owner3});
      let owners = await saitoTokenV1.getOwners.call();
      assert(owners.length == 4, "length is 4");
      let txResponse1 = await saitoTokenV1.transfer(owner2, 10000000004, {from: owner1});
      let txResponse2 = await saitoTokenV1.transfer(owner2, 10000000004, {from: owner3});
      let txResponse3 = await saitoTokenV1.transfer(owner2, 10000000004, {from: owner4});
      assert(arrayContains(owners, owner1),"has owner 1");
      assert(arrayContains(owners, owner3),"has owner 3");
      assert(arrayContains(owners, owner4),"has owner 4");
      assert.equal(txResponse3.logs[0].event, "RemovedOwner", "expected RemovedOwner event");
      assert.equal(txResponse3.logs[0].args.owner, owner2, "expected owner 2 removed");
      owners = await saitoTokenV1.getOwners.call();
      assert(owners.length == 3, "length is 3");
    });
    
    it("saitoTokenV1 can be transferred", async function() {
      let ownerBalance = await saitoTokenV1.balanceOf(owner1);
      let user1Balance = await saitoTokenV1.balanceOf(user1);
      await saitoTokenV1.transfer(user1, 1000, {from: owner1});
      let newOwnerBalance = await saitoTokenV1.balanceOf(owner1);
      let newUser1Balance = await saitoTokenV1.balanceOf(user1);
      assert.equal(newOwnerBalance.toNumber(), ownerBalance.toNumber() - 1000, "");
      assert.equal(newUser1Balance.toNumber(), user1Balance.toNumber() + 1000, "");
    });
    
    it("saitoTokenV1 can be with send()", async function() {
      let ownerBalance = await saitoTokenV1.balanceOf(owner1);
      let user1Balance = await saitoTokenV1.balanceOf(user1);
      await saitoTokenV1.send(user1, 1000, "0x0", {from: owner1});
      let newOwnerBalance = await saitoTokenV1.balanceOf(owner1);
      let newUser1Balance = await saitoTokenV1.balanceOf(user1);
      assert.equal(newOwnerBalance.toNumber(), ownerBalance.toNumber() - 1000, "");
      assert.equal(newUser1Balance.toNumber(), user1Balance.toNumber() + 1000, "");
    });
    
    it("saitoTokenV1 can be transferred through allowance", async function() {
      let ownerBalance = await saitoTokenV1.balanceOf(owner2);
      let user2Balance = await saitoTokenV1.balanceOf(user2);
      await saitoTokenV1.approve(user1, 2, {from: owner2});
      let allowance = await saitoTokenV1.allowance(owner2, user1, {from: owner2});
      assert.equal(allowance.toNumber(), 2, "");
      await saitoTokenV1.transferFrom(owner2, user2, 1, {from: user1});
      let newOwnerBalance = await saitoTokenV1.balanceOf(owner2);
      let newUser2Balance = await saitoTokenV1.balanceOf(user2);
      assert.equal(newOwnerBalance.toNumber(), ownerBalance.toNumber() - 1, "");
      assert.equal(newUser2Balance.toNumber(), user2Balance.toNumber() + 1, "");
    });
    
    it("saitoTokenV1 cannot transfer more than allowance allowance()/transferFrom()", async function() {
      let ownerBalance = await saitoTokenV1.balanceOf(owner2);
      let user2Balance = await saitoTokenV1.balanceOf(user2);
      await saitoTokenV1.transferFrom(owner2, user2, 2, {from: user1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Error: Revert (message: ERC777: transfer amount exceeds allowance)", "Returned error: VM Exception while processing transaction: revert ERC777: transfer amount exceeds allowance -- Reason given: ERC777: transfer amount exceeds allowance."], "Expected error related to allowance exceeded");
      });
    });
    
    it("saitoTokenV1 owners can be assigned as operators", async function() {
      await saitoTokenV1.authorizeOperator(owner1, {from: user1});
      let result = await saitoTokenV1.isOperatorFor(owner1, user1);
      assert(result, "owner1 to be operator for user1");
    });
    
    it("saitoTokenV1 non-owners cannot be assigned as operators", async function() {
      await saitoTokenV1.authorizeOperator(user2, {from: user1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Error: Revert or exceptional halt", "Returned error: VM Exception while processing transaction: revert"], "Expected unapproved revert");
      });
    });
    
    it("saitoTokenV1 burn publishes data as event", async function() {
      await saitoTokenV1.authorizeOperator(owner1, {from: user1});
      // Saito addresses are currently 45 bytes long. We will test with 25 bytes for now...
      let txResponse = await saitoTokenV1.burn(100, "0x000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F202122232425262728292A2B2C", {from: user1});
      assert.equal(txResponse.logs[0].event, "BurnAuth", "expected BurnAuth event");
      assert.equal(txResponse.logs[0].args.amount.toNumber(), 100, "expected 100 coins authorized");
      assert.equal(txResponse.logs[0].args.data, "0x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c", "Expected 45 bytes of data");
      let totalSupply = await saitoTokenV1.totalSupply.call();
      assert.equal(totalSupply.toNumber(), 2*initSupply, "expected burn to not actually burn, just authorize burn");
      let burnAuthorizationAmount = await saitoTokenV1.getBurnAuthorizationAmount.call(user1);
      let burnAuthorizationDataLow = await saitoTokenV1.getBurnAuthorizationData.call(user1, 0);
      let burnAuthorizationDataHigh = await saitoTokenV1.getBurnAuthorizationData.call(user1, 1);
      let burnAuthorizationLength = await saitoTokenV1.getBurnAuthorizationLength.call(user1);
      assert.equal(burnAuthorizationAmount.toNumber(), 100, "expected 100 tokens to be authorized");
      assert.equal(burnAuthorizationDataLow,'0x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f', "expected the first 32 bytes of the address");
      assert.equal(burnAuthorizationDataHigh,'0x202122232425262728292a2b2c00000000000000000000000000000000000000', "expected the first 32 bytes of the address");
      assert.equal(burnAuthorizationLength.toNumber(), 45, "expected length of bytes to be 45");
    });
    
    it("saitoTokenV1 operator can burn", async function() {
      let txResponse = await saitoTokenV1.operatorBurn(user1, 100, "0xbeef", "0xfeef", {from: owner1});
      let totalSupply = await saitoTokenV1.totalSupply.call();
      assert.equal(txResponse.logs[0].event, "Burned", "expected BurnAuth event");
      assert.equal(txResponse.logs[0].args.amount.toNumber(), 100, "expected 100 coins authorized");
      assert.equal(txResponse.logs[0].args.data, "0xbeef", "expected data to beef");
      assert.equal(txResponse.logs[0].args.operatorData, "0xfeef", "expected operator data to be feef");
      assert.equal(totalSupply.toNumber(), 2*initSupply - 100, "expected supply of " + (2*initSupply - 100));
    });
    
    it("saitoTokenV1 non-operators cannot burn", async function() {
      let txResponse = await saitoTokenV1.operatorBurn(user1, 100, "0x0", "0x0", {from: user2}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Error: Revert (message: ERC777: caller is not an operator for holder)", "Returned error: VM Exception while processing transaction: revert ERC777: caller is not an operator for holder -- Reason given: ERC777: caller is not an operator for holder."], "Expected unapproved revert");
      });
    });
    
    it("saitoTokenV1 operator cannot burn more than user's balance", async function() {
      let txResponse = await saitoTokenV1.operatorBurn(user1, 1001, "0xbeef", "0xfeef", {from: owner1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Error: Revert or exceptional halt", "Returned error: VM Exception while processing transaction: revert"]);
      });
    });
    
    it("saitoTokenV1 operator transfer", async function() {
      let txResponse = await saitoTokenV1.operatorSend(user1, owner1, 1, "0x0", "0x0", {from: owner1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Error: Revert or exceptional halt", "Returned error: VM Exception while processing transaction: revert"]);
      });
    });
    
    it("saitoTokenV1 can revokeOperator", async function() {
      await saitoTokenV1.revokeOperator(owner1, {from: user1});
      let txResponse = await saitoTokenV1.operatorBurn(user1, 100, "0x0", "0x0", {from: owner1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Error: Revert (message: ERC777: caller is not an operator for holder)", "Returned error: VM Exception while processing transaction: revert ERC777: caller is not an operator for holder -- Reason given: ERC777: caller is not an operator for holder."], "Expected unapproved revert");
      });
    });
  });
});
