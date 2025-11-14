import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 在 ES Module 中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量文件，.env.local 优先于 .env
// 先加载 .env，再加载 .env.local（覆盖相同的键）
dotenv.config({ path: path.resolve(__dirname, ".env") });
if (fs.existsSync(path.resolve(__dirname, ".env.local"))) {
  dotenv.config({ path: path.resolve(__dirname, ".env.local"), override: true });
}

const config = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    localhost: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: process.env.SEPOLIA_RPC_URL || configVariable("SEPOLIA_RPC_URL"),
      accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [configVariable("SEPOLIA_PRIVATE_KEY")],
      chainId: 11155111,
    },
    bscTestnet: {
      type: "http",
      chainType: "l1",
      url: process.env.BSC_TESTNET_RPC_URL || configVariable("BSC_TESTNET_RPC_URL"),
      accounts: process.env.BSC_TESTNET_PRIVATE_KEY ? [process.env.BSC_TESTNET_PRIVATE_KEY] : [configVariable("BSC_TESTNET_PRIVATE_KEY")],
      chainId: 97,
    },
    baseSepolia: {
      type: "http",
      chainType: "l1",
      url: process.env.BASE_SEPOLIA_RPC_URL || configVariable("BASE_SEPOLIA_RPC_URL"),
      accounts: process.env.BASE_SEPOLIA_PRIVATE_KEY ? [process.env.BASE_SEPOLIA_PRIVATE_KEY] : [configVariable("BASE_SEPOLIA_PRIVATE_KEY")],
      chainId: 84532,
    },
  },
  // 配置区块链浏览器 API（用于合约验证）
  // 使用 Etherscan Multichain API - 一个 Key 支持 60+ 链
  etherscan: {
    apiKey: {
      // Ethereum 网络
      eth: process.env.ETHERSCAN_API_KEY || "",
      ethSepolia: process.env.ETHERSCAN_API_KEY || "",
      // BSC 网络（优先使用 Multichain API Key）
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
      // Base 网络
      base: process.env.BASE_API_KEY || "",
      baseSepolia: process.env.BASE_API_KEY || "",
    },
    chainDescriptors: {
      // === Ethereum 网络 ===
      1: {
        name: "ethereum",
        blockExplorerUrl: {
          etherscan: {
            name: "ethereum",
            url: "https://etherscan.io",
            apiURL: "https://api.etherscan.io/api",
          }
        }
      },
      11155111: {
        name: "sepolia",
        blockExplorerUrl: {
          etherscan: {
            name: "sepolia",
            url: "https://sepolia.etherscan.io",
            apiURL: "https://api-sepolia.etherscan.io/api",
          }
        }
      },
      // === BSC 网络 ===
      56: {
        name: "bsc",
        blockExplorerUrl: {
          etherscan: {
            name: "bsc",
            url: "https://bscscan.com",
            apiURL: "https://api.bscscan.com/api",
          }
        }
      }, 
      97: {
        name: "bscTestnet",
        blockExplorerUrl: {
          etherscan: {
            name: "bscTestnet", 
            url: "https://testnet.bscscan.com",
            apiURL: "https://api-testnet.bscscan.com/api",
          }
        }
      },
      // === Base 网络 ===
      8453: {
        name: "base",
        blockExplorerUrl: {
          etherscan: {
            name: "base",
            url: "https://basescan.org",
            apiURL: "https://api.basescan.org/api",
          }
        }
      },
      84532: {
        name: "baseSepolia",
        blockExplorerUrl: {
          etherscan: {
            name: "baseSepolia",
            url: "https://sepolia.basescan.org",
            apiURL: "https://api-sepolia.basescan.org/api",
          }
        }
      },
    }
  },
};

export default config as HardhatUserConfig