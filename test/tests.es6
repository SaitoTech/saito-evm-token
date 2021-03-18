'use strict';
const SaitoToken = artifacts.require('SaitoToken.sol');
//const { expectEvent, singletons, constants } = require('@openzeppelin/test-helpers');
const { makeMintingMessage32, manuallySign, splitSignature } = require('../scripts/lib/helperfunctions');
let BN = web3.utils.BN;

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

  let saitoToken, erc1820;
  let fakeUser = "0x0000000000000000000000000000000000000000";
  let decimals = new BN(10).pow(new BN(18))
  let initSupply = new BN(1000000).mul(decimals);
  let maxSupply = new BN(10000000000).mul(decimals);
  let addOwnerKey = 10000000002;
  let removeOwnerKey = 10000000001;
  let addMintAuthKey = "0x0000000000000000000000000000000000000002";
  let removeMintAuthKey = "0x0000000000000000000000000000000000000001";
  
  let saitoTokenName = "Saito Token";
  let saitoTokenTicker = "STT";
  describe('SaitoToken Tests', function() {
  
    before(async() => {
      // Change the hardcoded owners to the test owners in the contract binary
      SaitoToken.unlinked_binary = SaitoToken.unlinked_binary.replace("1111222233334444555566667777888899991111", owner1.slice(2));
      SaitoToken.unlinked_binary = SaitoToken.unlinked_binary.replace("1111222233334444555566667777888899992222", owner2.slice(2));
      SaitoToken.unlinked_binary = SaitoToken.unlinked_binary.replace("1111222233334444555566667777888899993333", owner3.slice(2));
      saitoToken = await SaitoToken.new(saitoTokenName, saitoTokenTicker, { from: owner1 });
    });

    it("saitoToken decimals is 18", async function() {
      let decimals = await saitoToken.decimals.call();
      assert(decimals == 18);
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

    it("saitoToken cannot be minted with a bad sig", async function() {
      let nonce = await saitoToken.getMintingNonce();
      let message = makeMintingMessage32(nonce, initSupply, web3);
      let sigObj1 = splitSignature(await manuallySign(message, owner1, web3), web3);
      let sigObj2 = splitSignature(await manuallySign(message, owner2, web3), web3);
      let sigObj3 = splitSignature(await manuallySign(message, owner3, web3), web3);

      let totalSupply = await saitoToken.totalSupply.call();
      let owner1Balance = await saitoToken.balanceOf(owner1);
      assert.equal("0x00000000000000000000000000000000000000000000d3c21bcecceda1000000", message);
      await saitoToken.mint(message, sigObj1[0], sigObj1[1], sigObj2[2], sigObj2[0], sigObj2[1], sigObj2[2], sigObj3[0], sigObj3[1], sigObj3[2], {from: owner1}).then(() => {
      // Note that this is wrong ---------------------------------^
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Returned error: VM Exception while processing transaction: revert Not approved by owner1 -- Reason given: Not approved by owner1.", "Error: Revert or exceptional halt"]);
      });
    });

    it("saitoToken can be minted", async function() {
      let nonce = await saitoToken.getMintingNonce();
      let message = makeMintingMessage32(nonce, initSupply, web3);
      let sigObj1 = splitSignature(await manuallySign(message, owner1, web3), web3);
      let sigObj2 = splitSignature(await manuallySign(message, owner2, web3), web3);
      let sigObj3 = splitSignature(await manuallySign(message, owner3, web3), web3);
      let accounts = await web3.eth.getAccounts();
      let totalSupply = await saitoToken.totalSupply.call();
      let owner1Balance = await saitoToken.balanceOf(owner1);

      assert.equal("0x00000000000000000000000000000000000000000000d3c21bcecceda1000000", message);
      await saitoToken.mint(message, sigObj1[0], sigObj1[1], sigObj1[2], sigObj2[0], sigObj2[1], sigObj2[2], sigObj3[0], sigObj3[1], sigObj3[2], {from: owner1})
      //await saitoToken.mint(package1.message, package1.sigObj[0], package1.sigObj[1], package1.sigObj[2], package2.sigObj[0], package2.sigObj[1], package2.sigObj[2], package3.sigObj[0], package3.sigObj[1], package3.sigObj[2], {from: owner1});
      let newTotalSupply = await saitoToken.totalSupply.call();
      let newOwner1Balance = await saitoToken.balanceOf(owner1);
      assert.equal(newOwner1Balance.sub(owner1Balance).sub(initSupply).toString(), "0", "Expected owner 1 to have initSupply more tokens");
      assert.equal(newTotalSupply.sub(totalSupply).sub(initSupply).toString(), "0", "Expected totalSupply to be initSupply more tokens");
    });

    it("saitoToken minting cannot be replayed", async function() {
      let message = makeMintingMessage32(0, initSupply, web3);
      let sigObj1 = splitSignature(await manuallySign(message, owner1, web3), web3);
      let sigObj2 = splitSignature(await manuallySign(message, owner2, web3), web3);
      let sigObj3 = splitSignature(await manuallySign(message, owner3, web3), web3);
      await saitoToken.mint(message, sigObj1[0], sigObj1[1], sigObj1[2], sigObj2[0], sigObj2[1], sigObj2[2], sigObj3[0], sigObj3[1], sigObj3[2], {from: owner1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert(error.message.includes("nonce must match"));
      });
    });

    it("saitoToken can be minted by signing the next nonce", async function() {
      let nonce = await saitoToken.getMintingNonce();
      let message = makeMintingMessage32(nonce, initSupply, web3);
      let sigObj1 = splitSignature(await manuallySign(message, owner1, web3), web3);
      let sigObj2 = splitSignature(await manuallySign(message, owner2, web3), web3);
      let sigObj3 = splitSignature(await manuallySign(message, owner3, web3), web3);
      let totalSupply = await saitoToken.totalSupply.call();
      let owner1Balance = await saitoToken.balanceOf(owner1);
      assert.equal("0x00000000000000000000000000000001000000000000d3c21bcecceda1000000", message);
      await saitoToken.mint(message, sigObj1[0], sigObj1[1], sigObj1[2], sigObj2[0], sigObj2[1], sigObj2[2], sigObj3[0], sigObj3[1], sigObj3[2], {from: owner2});
      let newTotalSupply = await saitoToken.totalSupply.call();
      let newOwner1Balance = await saitoToken.balanceOf(owner1);
      assert.equal(newTotalSupply.sub(totalSupply).sub(initSupply).toString(), "0", "Expected totalSupply to be initSupply more tokens");
      assert.equal(newOwner1Balance.sub(owner1Balance).sub(initSupply).toString(), "0", "Expected owner 1 to have initSupply more tokens");
    });
  
    it("saitoToken can be transferred", async function() {
      let ownerBalance = await saitoToken.balanceOf(owner1);
      let user1Balance = await saitoToken.balanceOf(user1);
      await saitoToken.transfer(user1, 1000, {from: owner1});
      let newOwnerBalance = await saitoToken.balanceOf(owner1);
      let newUser1Balance = await saitoToken.balanceOf(user1);
      assert.equal(newOwnerBalance.sub(ownerBalance).add(new BN(1000)).toString(), "0", "");
      assert.equal(newUser1Balance.sub(user1Balance).sub(new BN(1000)).toString(), "0", "");
    });

    it("saitoToken can be transferred through allowance", async function() {
      let ownerBalance = await saitoToken.balanceOf(owner1);
      let user2Balance = await saitoToken.balanceOf(user2);
      await saitoToken.approve(user1, 2, {from: owner1});
      let allowance = await saitoToken.allowance(owner1, user1, {from: owner1});
      assert.equal(allowance.toNumber(), 2, "");
      await saitoToken.transferFrom(owner1, user2, 1, {from: user1});
      let newOwnerBalance = await saitoToken.balanceOf(owner1);
      let newUser2Balance = await saitoToken.balanceOf(user2);
      assert.equal(newOwnerBalance.sub(ownerBalance).add(new BN(1)).toString(), "0", "");
      assert.equal(newUser2Balance.sub(user2Balance).sub(new BN(1)).toString(), "0", "");
    });

    it("saitoToken cannot transfer more than allowance allowance()/transferFrom()", async function() {
      let ownerBalance = await saitoToken.balanceOf(owner1);
      let user2Balance = await saitoToken.balanceOf(user2);
      await saitoToken.transferFrom(owner1, user2, 2, {from: user1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert(error.message.includes("transfer amount exceeds allowance"));
      });
    });

    it("saitoToken burn publishes data as event", async function() {
      let user1Balance = await saitoToken.balanceOf(user1);
      let txResponse = await saitoToken.burn(100, "0x000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F202122232425262728292A2B2C", {from: user1});
      let totalSupply = await saitoToken.totalSupply.call();
      assert.equal(txResponse.logs[1].event, "Burned", "expected Burned event");
      assert.equal(txResponse.logs[1].args.amount.toNumber(), 100, "expected 100 coins authorized");
      assert.equal(txResponse.logs[1].args.data, "0x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c", "Expected 45 bytes of data");
      assert.equal(totalSupply.sub(initSupply).sub(initSupply).add(new BN(100)).toNumber(), 0, "expected burn to burn 100 tokens");
    });

    it("saitoToken can burn", async function() {
      let totalSupply = await saitoToken.totalSupply.call();
      let user1Balance = await saitoToken.balanceOf(user1);
      let txResponse = await saitoToken.burn(100, "0xbeef", {from: user1});
      assert.equal(txResponse.logs[1].event, "Burned", "expected Burned event");
      assert.equal(txResponse.logs[1].args.amount.toNumber(), 100, "expected 100 coins authorized");
      assert.equal(txResponse.logs[1].args.data, "0xbeef", "expected data to beef");
      let newTotalSupply = await saitoToken.totalSupply.call();
      let newUser1Balance = await saitoToken.balanceOf(user1);
      assert.equal(user1Balance.sub(newUser1Balance).sub(new BN(100)).toString(), "0", "Expected user 1 to have 100 less tokens");
      assert.equal(totalSupply.sub(newTotalSupply).sub(new BN(100)).toString(), "0", "Expected totalSupply to be 100 less tokens");
    });

    it("saitoToken owners can increment nonce", async function() {
      await saitoToken.incrementNonce({from: owner1});
      await saitoToken.incrementNonce({from: owner2});
      await saitoToken.incrementNonce({from: owner3});
    });
  });
});
