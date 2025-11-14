import { network } from "hardhat";
import { getContract, parseAbi, encodeFunctionData } from "viem";

console.log("🔗 连接到已部署的合约...\n");

// ===== 配置部分 =====
// 1. 合约地址（替换成你部署的合约地址）
// https://testnet.bscscan.com/address/0x6feaead4af6270eec353c5a448d594b101abc2f0
const COUNTER_ADDRESS = "0x6feaead4af6270eec353c5a448d594b101abc2f0" as `0x${string}`;
const NETWORK = "bscTestnet";

// 2. 合约 ABI（可以手动定义或从编译产物中读取）
const COUNTER_ABI = parseAbi([
  "function x() view returns (uint256)",
  "function inc() public",
  "function incBy(uint256 by) public",
  "event Increment(uint256 by)",
]);

// ===== 连接网络 =====
const { viem } = await network.connect({
  network: NETWORK,
  chainType: "l1",
});

const publicClient = await viem.getPublicClient();
const [walletClient] = await viem.getWalletClients();

console.log("📍 当前账户:", walletClient.account.address);
console.log("📜 合约地址:", COUNTER_ADDRESS);
console.log();

const counterContract = getContract({
  address: COUNTER_ADDRESS,
  abi: COUNTER_ABI,
  client: { public: publicClient, wallet: walletClient },
});

// 读取
const value2 = await counterContract.read.x();
console.log(`📖 通过 getContract 读取 x: ${value2}\n`);

// 写入
console.log("✍️  通过 getContract 调用 inc():");
const tx2 = await counterContract.write.inc();
console.log(`   交易哈希: ${tx2}\n`);

// ===== 方法三：手动编码函数调用（底层方法） =====
console.log("=== 方法三：手动编码函数调用 ===\n");

// 编码函数调用数据
const incData = encodeFunctionData({
  abi: COUNTER_ABI,
  functionName: "inc",
});

console.log("🔧 编码后的 inc() 调用数据:", incData);

// 使用编码后的数据发送交易
const tx3 = await walletClient.sendTransaction({
  to: COUNTER_ADDRESS,
  data: incData,
});

console.log(`📝 交易哈希: ${tx3}\n`);

// 编码带参数的函数
const incBy10Data = encodeFunctionData({
  abi: COUNTER_ABI,
  functionName: "incBy",
  args: [10n],
});

console.log("🔧 编码后的 incBy(10) 调用数据:", incBy10Data, "\n");