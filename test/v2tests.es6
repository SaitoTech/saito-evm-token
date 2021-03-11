'use strict';
const SaitoTokenV2 = artifacts.require('SaitoTokenV2.sol');

const { expectEvent, singletons, constants } = require('@openzeppelin/test-helpers');

const { signMessageWithNonce } = require('../scripts/lib/helperfunctions');

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

  let saitoTokenV2, erc1820;
  let fakeUser = "0x0000000000000000000000000000000000000000";
  let initSupply = 1000000;
  let maxSupply = 10000000000;
  let addOwnerKey = 10000000002;
  let removeOwnerKey = 10000000001;
  let addMintAuthKey = "0x0000000000000000000000000000000000000002";
  let removeMintAuthKey = "0x0000000000000000000000000000000000000001";
  
  let saitoTokenV2Name = "Saito Token";
  let saitoTokenV2Ticker = "STT";
  describe('SaitoTokenV2 Tests', function() {
    
    before(async() => {
      erc1820 = await singletons.ERC1820Registry(registryFunder);
      saitoTokenV2 = await SaitoTokenV2.new(saitoTokenV2Name, saitoTokenV2Ticker, owner1, owner2, owner3, { from: owner1 });
    });
    
    it("saitoTokenV2 granularity is 1", async function() {
      let granularity = await saitoTokenV2.granularity.call();
      assert(granularity == 1);
    });
    
    it("saitoTokenV2 decimals is 18", async function() {
      let decimals = await saitoTokenV2.decimals.call();
      assert(decimals == 18);
    });
    
    it("saitoTokenV2 defaultOperators is empty", async function() {
      let defaultOperators = await saitoTokenV2.defaultOperators.call();
      assert.equal(defaultOperators.length, 0, "defaultOperators should be empty");
    });
    
    it("saitoTokenV2 name is set", async function() {
      let name = await saitoTokenV2.name.call();
      assert.equal(name, saitoTokenV2Name, "name should be set");
    });
    
    it("saitoTokenV2 ticker is set", async function() {
      let ticker = await saitoTokenV2.symbol.call();
      assert.equal(ticker, saitoTokenV2Ticker, "ticker should be set");
    });
    
    it("saitoTokenV2 initial supply is 0", async function() {
      let totalSupply = await saitoTokenV2.totalSupply.call();
      assert.equal(totalSupply.toNumber(), 0);
    });
    
    it("saitoTokenV2 cannot be minted by non-owner", async function() {
      await saitoTokenV2.authorizeMinting(initSupply, {from: user1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        // Starting tests with stacktrace switch(truffle test --stacktrace), which can be useful,
        // causes different error messages so we use oneOf to make the test pass in both cases
        assert.oneOf(error.message, ["Error: Revert or exceptional halt", "Returned error: VM Exception while processing transaction: revert"], "Expected unapproved revert")
      });
    });
    
    it("saitoTokenV2 can be minted by owners", async function() {
      await saitoTokenV2.authorizeMinting(initSupply, {from: owner1});
      await saitoTokenV2.authorizeMinting(initSupply, {from: owner2});
      await saitoTokenV2.authorizeMinting(initSupply, {from: owner3});
      let totalSupply = await saitoTokenV2.totalSupply.call();
      assert.equal(totalSupply.toNumber(), initSupply, "expected supply of " + initSupply);
      let owner1Balance = await saitoTokenV2.balanceOf(owner1);
      let owner2Balance = await saitoTokenV2.balanceOf(owner2);
      let owner3Balance = await saitoTokenV2.balanceOf(owner3);
      assert.equal(owner1Balance.toNumber(), 0);
      assert.equal(owner2Balance.toNumber(), 0);
      assert.equal(owner3Balance.toNumber(), initSupply);
    });
    
    it("saitoTokenV2 after minting, authorizations are reset", async function() {
      await saitoTokenV2.authorizeMinting(initSupply, {from: owner3});
      let totalSupply = await saitoTokenV2.totalSupply.call();
      assert.equal(totalSupply.toNumber(), initSupply, "expected supply of " + initSupply);
      await saitoTokenV2.authorizeMinting(initSupply, {from: owner2});
      await saitoTokenV2.authorizeMinting(initSupply, {from: owner1});
      totalSupply = await saitoTokenV2.totalSupply.call();
      assert.equal(totalSupply.toNumber(), 2*initSupply, "expected supply of " + 2*initSupply);
      let owner1Balance = await saitoTokenV2.balanceOf(owner1);
      let owner2Balance = await saitoTokenV2.balanceOf(owner2);
      let owner3Balance = await saitoTokenV2.balanceOf(owner3);
      assert.equal(owner1Balance.toNumber(), initSupply);
      assert.equal(owner2Balance.toNumber(), 0);
      assert.equal(owner3Balance.toNumber(), initSupply);
    });
    
    it("saitoTokenV2 cannot mint more than 10,000,000,000", async function() {
      
      let totalSupply = await saitoTokenV2.totalSupply.call();
      await saitoTokenV2.authorizeMinting(maxSupply - totalSupply.toNumber() + 1, {from: owner1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Error: Revert or exceptional halt", "Returned error: VM Exception while processing transaction: revert"], "Expected unapproved revert")
      });
    });
    
    it("saitoTokenV2 owners can revoke minting auth", async function() {
      await saitoTokenV2.authorizeMinting(initSupply, {from: owner1});
      await saitoTokenV2.authorizeMinting(initSupply, {from: owner2});
      await saitoTokenV2.deauthorizeMinting({from: owner2});
      await saitoTokenV2.authorizeMinting(initSupply, {from: owner3});
      let totalSupply = await saitoTokenV2.totalSupply.call();
      assert.equal(totalSupply.toNumber(), 2*initSupply, "expected supply of " + 2*initSupply);
      await saitoTokenV2.authorizeMinting(initSupply, {from: owner2});
      totalSupply = await saitoTokenV2.totalSupply.call();
      assert.equal(totalSupply.toNumber(), 3*initSupply, "expected supply of " + 3*initSupply);
      let owner1Balance = await saitoTokenV2.balanceOf(owner1);
      let owner2Balance = await saitoTokenV2.balanceOf(owner2);
      let owner3Balance = await saitoTokenV2.balanceOf(owner3);
      assert.equal(owner1Balance.toNumber(), initSupply);
      assert.equal(owner2Balance.toNumber(), initSupply);
      assert.equal(owner3Balance.toNumber(), initSupply);
    });
    
    it("saitoTokenV2 can be transferred", async function() {
      let ownerBalance = await saitoTokenV2.balanceOf(owner1);
      let user1Balance = await saitoTokenV2.balanceOf(user1);
      await saitoTokenV2.transfer(user1, 1000, {from: owner1});
      let newOwnerBalance = await saitoTokenV2.balanceOf(owner1);
      let newUser1Balance = await saitoTokenV2.balanceOf(user1);
      assert.equal(newOwnerBalance.toNumber(), ownerBalance.toNumber() - 1000, "");
      assert.equal(newUser1Balance.toNumber(), user1Balance.toNumber() + 1000, "");
    });
    
    it("saitoTokenV2 can be transfered with send()", async function() {
      let ownerBalance = await saitoTokenV2.balanceOf(owner1);
      let user1Balance = await saitoTokenV2.balanceOf(user1);
      await saitoTokenV2.send(user1, 1000, "0x0", {from: owner1});
      let newOwnerBalance = await saitoTokenV2.balanceOf(owner1);
      let newUser1Balance = await saitoTokenV2.balanceOf(user1);
      assert.equal(newOwnerBalance.toNumber(), ownerBalance.toNumber() - 1000, "");
      assert.equal(newUser1Balance.toNumber(), user1Balance.toNumber() + 1000, "");
    });
    
    it("saitoTokenV2 can be transferred through allowance", async function() {
      let ownerBalance = await saitoTokenV2.balanceOf(owner2);
      let user2Balance = await saitoTokenV2.balanceOf(user2);
      await saitoTokenV2.approve(user1, 2, {from: owner2});
      let allowance = await saitoTokenV2.allowance(owner2, user1, {from: owner2});
      assert.equal(allowance.toNumber(), 2, "");
      await saitoTokenV2.transferFrom(owner2, user2, 1, {from: user1});
      let newOwnerBalance = await saitoTokenV2.balanceOf(owner2);
      let newUser2Balance = await saitoTokenV2.balanceOf(user2);
      assert.equal(newOwnerBalance.toNumber(), ownerBalance.toNumber() - 1, "");
      assert.equal(newUser2Balance.toNumber(), user2Balance.toNumber() + 1, "");
    });
    
    it("saitoTokenV2 cannot transfer more than allowance allowance()/transferFrom()", async function() {
      let ownerBalance = await saitoTokenV2.balanceOf(owner2);
      let user2Balance = await saitoTokenV2.balanceOf(user2);
      await saitoTokenV2.transferFrom(owner2, user2, 2, {from: user1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Error: Revert (message: ERC777: transfer amount exceeds allowance)", "Returned error: VM Exception while processing transaction: revert ERC777: transfer amount exceeds allowance -- Reason given: ERC777: transfer amount exceeds allowance."], "Expected error related to allowance exceeded");
      });
    });
    
    it("saitoTokenV2 authorizeOperator cannot be called", async function() {
      await saitoTokenV2.authorizeOperator(owner1, {from: user1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Returned error: VM Exception while processing transaction: revert", "Error: Revert or exceptional halt"]);
      });
    });
    
    it("saitoTokenV2 revokeOperator cannot be called", async function() {
      await saitoTokenV2.revokeOperator(owner1, {from: user1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Returned error: VM Exception while processing transaction: revert", "Error: Revert or exceptional halt"]);
      });
    });
    
    it("saitoTokenV2 operatorSend cannot be called", async function() {
      await saitoTokenV2.operatorSend(user1, user2, 10, "0x0", "0x0", {from: owner1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Returned error: VM Exception while processing transaction: revert", "Error: Revert or exceptional halt"]);
      });
    });
    
    it("saitoTokenV2 operatorBurn cannot be called", async function() {
      await saitoTokenV2.operatorBurn(user1, 10, "0x0", "0x0", {from: owner1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Returned error: VM Exception while processing transaction: revert", "Error: Revert or exceptional halt"]);
      });
    });
    
    it("saitoTokenV2 burn publishes data as event", async function() {
      let user1Balance = await saitoTokenV2.balanceOf(user1);
      // Saito addresses are currently 45 bytes long. We will test with 25 bytes for now...
      let txResponse = await saitoTokenV2.burn(100, "0x000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F202122232425262728292A2B2C", {from: user1});
      let totalSupply = await saitoTokenV2.totalSupply.call();
      assert.equal(txResponse.logs[0].event, "Burned", "expected Burned event");
      assert.equal(txResponse.logs[0].args.amount.toNumber(), 100, "expected 100 coins authorized");
      assert.equal(txResponse.logs[0].args.data, "0x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c", "Expected 45 bytes of data");
      assert.equal(totalSupply.toNumber(), 3 * initSupply -  100, "expected burn to burn 100 tokens");
      
    });
    
    it("saitoTokenV2 can burn", async function() {
      let totalSupply = await saitoTokenV2.totalSupply.call();
      let user1Balance = await saitoTokenV2.balanceOf(user1);
      let txResponse = await saitoTokenV2.burn(100, "0xbeef", {from: user1});
      assert.equal(txResponse.logs[0].event, "Burned", "expected Burned event");
      assert.equal(txResponse.logs[0].args.amount.toNumber(), 100, "expected 100 coins authorized");
      assert.equal(txResponse.logs[0].args.data, "0xbeef", "expected data to beef");
      let newTotalSupply = await saitoTokenV2.totalSupply.call();
      let newUser1Balance = await saitoTokenV2.balanceOf(user1);
      assert.equal(user1Balance.toNumber() - newUser1Balance.toNumber(), 100, "Expected user 1 to have 100 less tokens");
      assert.equal(totalSupply.toNumber() - newTotalSupply.toNumber(), 100, "Expected totalSupply to be 100 less tokens");
    });
    
    it("saitoTokenV2 can be minted with a single transaction", async function() {
      let package1 = await signMessageWithNonce(0, initSupply, owner1, web3);
      let package2 = await signMessageWithNonce(0, initSupply, owner2, web3);
      let package3 = await signMessageWithNonce(0, initSupply, owner3, web3);
      //let user1Balance = await saitoTokenV2.balanceOf(user1);
      let totalSupply = await saitoTokenV2.totalSupply.call();
      let owner1Balance = await saitoTokenV2.balanceOf(owner1);
      assert.equal("0x00000000000000000000000000000000000000000000000000000000000f4240", package1[0]); // 0xf4240 = 1000000
      assert.equal("0x00000000000000000000000000000000000000000000000000000000000f4240", package2[0]);
      assert.equal("0x00000000000000000000000000000000000000000000000000000000000f4240", package3[0]);
      await saitoTokenV2.mint(package1[0], package1[1], package1[2], package1[3], package2[1], package2[2], package2[3], package3[1], package3[2], package3[3], {from: owner1});
      let newTotalSupply = await saitoTokenV2.totalSupply.call();
      let newOwner1Balance = await saitoTokenV2.balanceOf(owner1);
      assert.equal(newOwner1Balance.toNumber() - owner1Balance.toNumber(), initSupply, "Expected owner 1 to have initSupply more tokens");
      assert.equal(newTotalSupply.toNumber() - totalSupply.toNumber(), initSupply, "Expected totalSupply to be initSupply more tokens");
    });
    
    it("saitoTokenV2 minting cannot be replayed", async function() {
      let package1 = await signMessageWithNonce(0, initSupply, owner1, web3);
      let package2 = await signMessageWithNonce(0, initSupply, owner2, web3);
      let package3 = await signMessageWithNonce(0, initSupply, owner3, web3);
      //let user1Balance = await saitoTokenV2.balanceOf(user1);
      await saitoTokenV2.mint(package1[0], package1[1], package1[2], package1[3], package2[1], package2[2], package2[3], package3[1], package3[2], package3[3], {from: owner1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Returned error: VM Exception while processing transaction: revert", "Error: Revert or exceptional halt"]);
      });
    });
    
    it("saitoTokenV2 can be minted by signing the next nonce", async function() {
      let nonce = await saitoTokenV2.getMiningNonce();
      let package1 = await signMessageWithNonce(nonce, initSupply, owner1, web3);
      let package2 = await signMessageWithNonce(nonce, initSupply, owner2, web3);
      let package3 = await signMessageWithNonce(nonce, initSupply, owner3, web3);
      //let user1Balance = await saitoTokenV2.balanceOf(user1);
      let totalSupply = await saitoTokenV2.totalSupply.call();
      let owner1Balance = await saitoTokenV2.balanceOf(owner1);
      assert.equal("0x00000000000000000000000000000000000000000000000000000001000f4240", package1[0]); // 0xf4240 = 1000000
      assert.equal("0x00000000000000000000000000000000000000000000000000000001000f4240", package2[0]);
      assert.equal("0x00000000000000000000000000000000000000000000000000000001000f4240", package3[0]);
      await saitoTokenV2.mint(package1[0], package1[1], package1[2], package1[3], package2[1], package2[2], package2[3], package3[1], package3[2], package3[3], {from: owner1});
      let newTotalSupply = await saitoTokenV2.totalSupply.call();
      let newOwner1Balance = await saitoTokenV2.balanceOf(owner1);
      assert.equal(newOwner1Balance.toNumber() - owner1Balance.toNumber(), initSupply, "Expected owner 1 to have initSupply more tokens");
      assert.equal(newTotalSupply.toNumber() - totalSupply.toNumber(), initSupply, "Expected totalSupply to be initSupply more tokens");
    });
    
  });
});
