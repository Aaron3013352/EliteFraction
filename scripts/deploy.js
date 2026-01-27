// const { ethers } = require("hardhat");

// async function main() {
//   const [deployer] = await ethers.getSigners();
//   console.log("Deploying contracts with account:", deployer.address);

//   const balance = await ethers.provider.getBalance(deployer.address);
//   console.log("Account balance:", balance.toString());

//   const FractionalOwnership = await ethers.getContractFactory("FractionalOwnership");
//   const contract = await FractionalOwnership.deploy(
//     "FractionalToken",
//     "FTK",
//     ethers.parseUnits("1000000", 18)
//   );

//   // Wait for the deployment to complete using ethers v6 API
//   await contract.waitForDeployment();
//   console.log("FractionalOwnership deployed to:", contract.target);
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error("Deployment failed:", error);
//     process.exit(1);
//   });

// scripts/deploy.js

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying contract with account:", deployer.address);
  console.log("💰 Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const name = "FractionalToken";
  const symbol = "FTK";
  const initialSupply = ethers.parseUnits("1000000", 18); // 1 million tokens

  const FractionalOwnership = await ethers.getContractFactory("FractionalOwnership");
  const contract = await FractionalOwnership.deploy(name, symbol, initialSupply);

  await contract.waitForDeployment();

  console.log("✅ FractionalOwnership deployed at:", contract.target);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
