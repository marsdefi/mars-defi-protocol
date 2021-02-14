import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

export default {
  default: 'hardhat',
  networks: {
    hardhat: {},

    rinkeby: {
      url: "https://rinkeby.infura.io/v3/db4f7069c34f44f78e9197ad5213ec68",
      accounts: ["0ac0cad67677d99f277203390c3a19ac0c4c8f797aec8ea39d78ca44b1993548"]
    }

  },
  solidity: {
    version: '0.7.6',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './build/cache',
    artifacts: './build/artifacts',
  },
  gasReporter: {
    currency: 'USD',
    enabled: true,
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: 'QHPMHTMMG9YP9MCEYV1VIYXEF51BQGDXZFs',
  },
};
