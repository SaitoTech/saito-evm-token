'use strict';
const SaitoToken = artifacts.require('SaitoToken.sol');
contract('Test Contracts', (accounts) => {
  let owner  = accounts[0];
  let user1 = accounts[1];
  let user2  = accounts[2];
  let user3  = accounts[3];
  let user4  = accounts[4];

  let saitoToken;
  let fakeUser = "0x0000000000000000000000000000000000000000";
  let initSupply = 10000000000;

  describe('SaitoToken Tests', function() {
    before(async() => {
      saitoToken = await SaitoToken.new("Saito", "SAITO");
    });
    it("saitoToken should have total supply ten billion", async function() {
      var totalSupply = await saitoToken.totalSupply.call();
      assert.equal(initSupply, totalSupply.toNumber(), "expected supply of " + initSupply);
    });
    it("saitoToken owner should have total supply", async function() {
      var totalSupply = await saitoToken.totalSupply.call();
      var ownerBalance = await saitoToken.balanceOf(owner);
      assert.equal(ownerBalance.toNumber(), totalSupply.toNumber(), "expected owner to have entire supply");
    });
    
    it("saitoToken can be transferred", async function() {
      var ownerBalance = await saitoToken.balanceOf(owner);
      var user1Balance = await saitoToken.balanceOf(user1);
      await saitoToken.transfer(user1, 1000, {from: owner});
      var newOwnerBalance = await saitoToken.balanceOf(owner);
      //console.log(out.toNumber());
      var newUser1Balance = await saitoToken.balanceOf(user1);
      assert.equal(newOwnerBalance.toNumber(), ownerBalance.toNumber() - 1000, "");
      assert.equal(newUser1Balance.toNumber(), user1Balance.toNumber() + 1000, "");
    });
    
    it("saitoToken can be transferred through allowanance", async function() {
      var ownerBalance = await saitoToken.balanceOf(owner);
      var user2Balance = await saitoToken.balanceOf(user2);
      var status = await saitoToken.approve(user1, 2, {from: owner});
      var allowance = await saitoToken.allowance(owner, user1, {from: owner});
      assert.equal(allowance.toNumber(), 2, "");
      var status = await saitoToken.transferFrom(owner, user2, 1, {from: user1});
      var newOwnerBalance = await saitoToken.balanceOf(owner);
      var newUser2Balance = await saitoToken.balanceOf(user2);
      assert.equal(newOwnerBalance.toNumber(), ownerBalance.toNumber() - 1, "");
      assert.equal(newUser2Balance.toNumber(), user2Balance.toNumber() + 1, "");
    });
  });

});
