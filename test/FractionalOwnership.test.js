// const { expect } = require("chai");

// describe("FractionalOwnership", function () {
//   it("Should deploy and have the correct name, symbol, and total supply", async function () {
//     const [owner] = await ethers.getSigners();
//     const FractionalOwnership = await ethers.getContractFactory("FractionalOwnership");
//     const contract = await FractionalOwnership.deploy(
//       "FractionalToken",
//       "FTK",
//       ethers.parseUnits("1000000", 18)
//     );
//     await contract.waitForDeployment();

//     expect(await contract.name()).to.equal("FractionalToken");
//     expect(await contract.symbol()).to.equal("FTK");

//     const totalSupply = await contract.totalSupply();
//     // Convert the formatted total supply to a number before comparing
//     const formattedSupply = parseFloat(ethers.formatUnits(totalSupply, 18));
//     expect(formattedSupply).to.equal(1000000);
//   });
// });



it("Should transfer tokens between accounts", async function () {
  const [owner, recipient] = await ethers.getSigners();
  const FractionalOwnership = await ethers.getContractFactory("FractionalOwnership");
  const contract = await FractionalOwnership.deploy("FractionalToken", "FTK", ethers.parseUnits("1000000", 18));
  await contract.waitForDeployment();

  // Transfer 100 tokens from owner to recipient
  await contract.transfer(recipient.address, ethers.parseUnits("100", 18));
  
  const recipientBalance = await contract.balanceOf(recipient.address);
  expect(ethers.formatUnits(recipientBalance, 18)).to.equal("100");
});
