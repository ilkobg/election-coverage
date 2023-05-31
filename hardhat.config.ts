import { HardhatUserConfig, task, subtask } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
};

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  /**
  networks: {
    // Goerli Testnet
    goerli: {
      url: `https://goerli.infura.io/v3/6883bf557e0d4c478934fc8ef22c8ed9`,
      chainId: 5,
      accounts: [
        `ACC_PRIVATE_KEY`,
      ],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at <https://etherscan.io/>
    apiKey: "APIKEY"
  }
  */
};

const lazyImport = async (module: any) => {
  return await import(module);
};

task("deploy", "Deploys contracts").setAction(async () => {
  const { main } = await lazyImport("./scripts/deploy-election");
  await main();
});

task("deploy-with-pk", "Deploys contract with pk")
  .addParam("privateKey", "Please provide the private key")
  .setAction(async ({ privateKey }) => {
    const { main } = await lazyImport("./scripts/deploy-pk");
    await main(privateKey);
});

subtask("print", "Prints a message")
  .addParam("message", "The message to print")
  .setAction(async (taskArgs) => {
    console.log(taskArgs.message);
});

export default config;
