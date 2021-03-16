'use strict';
const SaitoTokenV3 = artifacts.require('SaitoTokenV3.sol');
const { expectEvent, singletons, constants } = require('@openzeppelin/test-helpers');
const { makeMintingMessage32, manuallySign, splitSignature } = require('../scripts/lib/helperfunctions');

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

  let saitoTokenV3, erc1820;
  let fakeUser = "0x0000000000000000000000000000000000000000";
  let initSupply = 1000000 * (2**18);
  let maxSupply = 10000000000 * (2**18);
  let addOwnerKey = 10000000002;
  let removeOwnerKey = 10000000001;
  let addMintAuthKey = "0x0000000000000000000000000000000000000002";
  let removeMintAuthKey = "0x0000000000000000000000000000000000000001";
  
  let saitoTokenV3Name = "Saito Token";
  let saitoTokenV3Ticker = "STT";
  describe('SaitoTokenV3 Tests', function() {
  
    before(async() => {
      erc1820 = await singletons.ERC1820Registry(registryFunder);
      saitoTokenV3 = await SaitoTokenV3.new(saitoTokenV3Name, saitoTokenV3Ticker, { from: owner1 });
    });

    it("saitoTokenV3 decimals is 18", async function() {
      let decimals = await saitoTokenV3.decimals.call();
      assert(decimals == 18);
    });

    it("saitoTokenV3 decimals is 18", async function() {
      let decimals = await saitoTokenV3.decimals.call();
      assert(decimals == 18);
    });

    it("saitoTokenV3 name is set", async function() {
      let name = await saitoTokenV3.name.call();
      assert.equal(name, saitoTokenV3Name, "name should be set");
    });

    it("saitoTokenV3 ticker is set", async function() {
      let ticker = await saitoTokenV3.symbol.call();
      assert.equal(ticker, saitoTokenV3Ticker, "ticker should be set");
    });

    it("saitoTokenV3 initial supply is 0", async function() {
      let totalSupply = await saitoTokenV3.totalSupply.call();
      assert.equal(totalSupply.toNumber(), 0);
    });
    it("saitoTokenV3 decimals is 18", async function() {
      let decimals = await saitoTokenV3.decimals.call();
      assert(decimals == 18);
    });

    it("saitoTokenV3 decimals is 18", async function() {
      let decimals = await saitoTokenV3.decimals.call();
      assert(decimals == 18);
    });

    it("saitoTokenV3 name is set", async function() {
      let name = await saitoTokenV3.name.call();
      assert.equal(name, saitoTokenV3Name, "name should be set");
    });

    it("saitoTokenV3 ticker is set", async function() {
      let ticker = await saitoTokenV3.symbol.call();
      assert.equal(ticker, saitoTokenV3Ticker, "ticker should be set");
    });

    it("saitoTokenV3 initial supply is 0", async function() {
      let totalSupply = await saitoTokenV3.totalSupply.call();
      assert.equal(totalSupply.toNumber(), 0);
    });
    
    it("saitoTokenV3 cannot be minted with a bad sig", async function() {
      let nonce = await saitoTokenV3.getMiningNonce();
      let message = makeMintingMessage32(nonce, initSupply, web3);
      let sigObj1 = splitSignature(await manuallySign(message, owner1, web3), web3);
      let sigObj2 = splitSignature(await manuallySign(message, owner2, web3), web3);
      let sigObj3 = splitSignature(await manuallySign(message, owner3, web3), web3);

      let totalSupply = await saitoTokenV3.totalSupply.call();
      let owner1Balance = await saitoTokenV3.balanceOf(owner1);
      assert.equal("0x0000000000000000000000000000000000000000000000000000003d09000000", message);
      await saitoTokenV3.mint(message, sigObj1[0], sigObj1[1], sigObj2[2], sigObj2[0], sigObj2[1], sigObj2[2], sigObj3[0], sigObj3[1], sigObj3[2], {from: owner1}).then(() => {
      // Note that this is wrong ---------------------------------^
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Returned error: VM Exception while processing transaction: revert Not approved by owner1 -- Reason given: Not approved by owner1.", "Error: Revert or exceptional halt"]);
      });
    });

    it("saitoTokenV3 can be minted", async function() {
      let nonce = await saitoTokenV3.getMiningNonce();
      let message = makeMintingMessage32(nonce, initSupply, web3);
      let sigObj1 = splitSignature(await manuallySign(message, owner1, web3), web3);
      let sigObj2 = splitSignature(await manuallySign(message, owner2, web3), web3);
      let sigObj3 = splitSignature(await manuallySign(message, owner3, web3), web3);
      let accounts = await web3.eth.getAccounts();
      let totalSupply = await saitoTokenV3.totalSupply.call();
      let owner1Balance = await saitoTokenV3.balanceOf(owner1);

      assert.equal("0x0000000000000000000000000000000000000000000000000000003d09000000", message);
      await saitoTokenV3.mint(message, sigObj1[0], sigObj1[1], sigObj1[2], sigObj2[0], sigObj2[1], sigObj2[2], sigObj3[0], sigObj3[1], sigObj3[2], {from: owner1})
      //await saitoTokenV3.mint(package1.message, package1.sigObj[0], package1.sigObj[1], package1.sigObj[2], package2.sigObj[0], package2.sigObj[1], package2.sigObj[2], package3.sigObj[0], package3.sigObj[1], package3.sigObj[2], {from: owner1});
      let newTotalSupply = await saitoTokenV3.totalSupply.call();
      let newOwner1Balance = await saitoTokenV3.balanceOf(owner1);
      assert.equal(newOwner1Balance.toNumber() - owner1Balance.toNumber(), initSupply, "Expected owner 1 to have initSupply more tokens");
      assert.equal(newTotalSupply.toNumber() - totalSupply.toNumber(), initSupply, "Expected totalSupply to be initSupply more tokens");
    });

    it("saitoTokenV3 minting cannot be replayed", async function() {
      let message = makeMintingMessage32(0, initSupply, web3);
      let sigObj1 = splitSignature(await manuallySign(message, owner1, web3), web3);
      let sigObj2 = splitSignature(await manuallySign(message, owner2, web3), web3);
      let sigObj3 = splitSignature(await manuallySign(message, owner3, web3), web3);
      await saitoTokenV3.mint(message, sigObj1[0], sigObj1[1], sigObj1[2], sigObj2[0], sigObj2[1], sigObj2[2], sigObj3[0], sigObj3[1], sigObj3[2], {from: owner1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Returned error: VM Exception while processing transaction: revert", "Error: Revert or exceptional halt"]);
      });
    });

    it("saitoTokenV3 can be minted by signing the next nonce", async function() {
      
      let message1 = makeMintingMessage32(0, initSupply, web3);
      let message2 = makeMintingMessage32(1, initSupply, web3);
      let message3 = makeMintingMessage32(2, initSupply, web3);
      let nonce = await saitoTokenV3.getMiningNonce();
      let message = makeMintingMessage32(nonce, initSupply, web3);
      let sigObj1 = splitSignature(await manuallySign(message, owner1, web3), web3);
      let sigObj2 = splitSignature(await manuallySign(message, owner2, web3), web3);
      let sigObj3 = splitSignature(await manuallySign(message, owner3, web3), web3);
      let totalSupply = await saitoTokenV3.totalSupply.call();
      let owner2Balance = await saitoTokenV3.balanceOf(owner2);
      assert.equal("0x0000000000000000000000000000000000000000000000010000003d09000000", message);
      await saitoTokenV3.mint(message, sigObj1[0], sigObj1[1], sigObj1[2], sigObj2[0], sigObj2[1], sigObj2[2], sigObj3[0], sigObj3[1], sigObj3[2], {from: owner2});
      let newTotalSupply = await saitoTokenV3.totalSupply.call();
      let newOwner2Balance = await saitoTokenV3.balanceOf(owner2);
      assert.equal(newTotalSupply.toNumber() - totalSupply.toNumber(), initSupply, "Expected totalSupply to be initSupply more tokens");
      assert.equal(newOwner2Balance.toNumber() - owner2Balance.toNumber(), initSupply, "Expected owner 2 to have initSupply more tokens");
      
    });

    it("saitoTokenV3 can be transferred", async function() {
      let ownerBalance = await saitoTokenV3.balanceOf(owner1);
      let user1Balance = await saitoTokenV3.balanceOf(user1);
      await saitoTokenV3.transfer(user1, 1000, {from: owner1});
      let newOwnerBalance = await saitoTokenV3.balanceOf(owner1);
      let newUser1Balance = await saitoTokenV3.balanceOf(user1);
      assert.equal(newOwnerBalance.toNumber(), ownerBalance.toNumber() - 1000, "");
      assert.equal(newUser1Balance.toNumber(), user1Balance.toNumber() + 1000, "");
    });
    
    it("saitoTokenV3 can be transferred through allowance", async function() {
      let ownerBalance = await saitoTokenV3.balanceOf(owner2);
      let user2Balance = await saitoTokenV3.balanceOf(user2);
      await saitoTokenV3.approve(user1, 2, {from: owner2});
      let allowance = await saitoTokenV3.allowance(owner2, user1, {from: owner2});
      assert.equal(allowance.toNumber(), 2, "");
      await saitoTokenV3.transferFrom(owner2, user2, 1, {from: user1});
      let newOwnerBalance = await saitoTokenV3.balanceOf(owner2);
      let newUser2Balance = await saitoTokenV3.balanceOf(user2);
      assert.equal(newOwnerBalance.toNumber(), ownerBalance.toNumber() - 1, "");
      assert.equal(newUser2Balance.toNumber(), user2Balance.toNumber() + 1, "");
    });
    
    it("saitoTokenV3 cannot transfer more than allowance allowance()/transferFrom()", async function() {
      let ownerBalance = await saitoTokenV3.balanceOf(owner2);
      let user2Balance = await saitoTokenV3.balanceOf(user2);
      await saitoTokenV3.transferFrom(owner2, user2, 2, {from: user1}).then(() => {
        throw null;
      }).catch(function(error) {
        assert.isNotNull(error, "Expected unapproved revert");
        assert.oneOf(error.message, ["Error: Revert (message: ERC777: transfer amount exceeds allowance)", "Returned error: VM Exception while processing transaction: revert ERC20: transfer amount exceeds allowance -- Reason given: ERC20: transfer amount exceeds allowance."], "Expected error related to allowance exceeded");
      });
    });

    it("saitoTokenV3 burn publishes data as event", async function() {
      let user1Balance = await saitoTokenV3.balanceOf(user1);
      let txResponse = await saitoTokenV3.burn(100, "0x000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F202122232425262728292A2B2C", {from: user1});
      let totalSupply = await saitoTokenV3.totalSupply.call();
      assert.equal(txResponse.logs[1].event, "Burned", "expected Burned event");
      assert.equal(txResponse.logs[1].args.amount.toNumber(), 100, "expected 100 coins authorized");
      assert.equal(txResponse.logs[1].args.data, "0x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c", "Expected 45 bytes of data");
      assert.equal(totalSupply.toNumber(), 2 * initSupply -  100, "expected burn to burn 100 tokens");
    });

    it("saitoTokenV3 can burn", async function() {
      let totalSupply = await saitoTokenV3.totalSupply.call();
      let user1Balance = await saitoTokenV3.balanceOf(user1);
      let txResponse = await saitoTokenV3.burn(100, "0xbeef", {from: user1});
      assert.equal(txResponse.logs[1].event, "Burned", "expected Burned event");
      assert.equal(txResponse.logs[1].args.amount.toNumber(), 100, "expected 100 coins authorized");
      assert.equal(txResponse.logs[1].args.data, "0xbeef", "expected data to beef");
      let newTotalSupply = await saitoTokenV3.totalSupply.call();
      let newUser1Balance = await saitoTokenV3.balanceOf(user1);
      assert.equal(user1Balance.toNumber() - newUser1Balance.toNumber(), 100, "Expected user 1 to have 100 less tokens");
      assert.equal(totalSupply.toNumber() - newTotalSupply.toNumber(), 100, "Expected totalSupply to be 100 less tokens");
    });

    it("saitoTokenV3 owners can increment nonce", async function() {
      let errorHandler = (error) => {
        if(error.message == "Returned error: VM Exception while processing transaction: revert Only owners can increment the nonce -- Reason given: Only owners can increment the nonce.") {
          console.log(`
************************************************************************************************
************************************************************************************************
**** It appears that the owners in the contract do not match the accounts provided by web3. ****
**** Put these lines in the contract constructor: **********************************************

owner1 = ${owner1};
owner2 = ${owner2};
owner3 = ${owner3};

************************************************************************************************
************************************************************************************************
          `);
        } else {
          console.log(`
************************************************************************************************
************************************************************************************************
******************************* Unknown error setting nonces.... *******************************
${error.message}
************************************************************************************************
************************************************************************************************
          `);
        }
      }
      await saitoTokenV3.incrementNonce({from: owner1}).catch(errorHandler);
      await saitoTokenV3.incrementNonce({from: owner2}).catch(errorHandler);
      await saitoTokenV3.incrementNonce({from: owner3}).catch(errorHandler);
    });
  });
});
