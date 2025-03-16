require("@nomicfoundation/hardhat-toolbox");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.28",
  paths: {
    sources: "./contracts",  // This tells Hardhat to look for Solidity files here.
    artifacts: "./artifacts",
    cache: "./cache",
    tests: "./test"
  },
  networks: {
    ganache: {
      url: "http://127.0.0.1:8545",
    },
  },
};
