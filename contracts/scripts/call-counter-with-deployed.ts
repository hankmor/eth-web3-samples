import { network } from "hardhat";

// ========== 配置：修改这里的值 ==========
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`;
// const NETWORK = "bscTestnet"; // BSC 测试网
// const NETWORK = "hardhatMainnet"; // 临时本地网络, 脚本结束时会销毁
const NETWORK = "localhost"; // 持久化本地节点（需要先启动 hardhat node）

// ========== 连接合约 ==========
const { viem } = await network.connect({
  network: NETWORK,
  chainType: "l1",
});

// 通过合约名称和地址获取合约实例（需要在 contracts/ 目录中有对应的 .sol 文件）
const counter = await viem.getContractAt("Counter", CONTRACT_ADDRESS);

console.log("📜 合约地址:", counter.address);

// ========== 读取合约状态（免费，不消耗 gas） ==========
console.log("\n📖 读取合约状态:");
const currentX = await counter.read.x();
console.log("   x =", currentX);

// ========== 写入合约状态（需要支付 gas） ==========
console.log("\n✍️  调用 inc() 函数...");
const txHash = await counter.write.inc();
console.log("   交易哈希:", txHash);

// 等待交易确认
const publicClient = await viem.getPublicClient();
await publicClient.waitForTransactionReceipt({ hash: txHash });
console.log("   ✅ 交易已确认");

// 读取新值
const newX = await counter.read.x();
console.log("\n📊 新的 x 值:", newX);

// ========== 调用带参数的函数 ==========
console.log("\n✍️  调用 incBy(5)...");
const txHash2 = await counter.write.incBy([5n]); // 参数需要传数组
await publicClient.waitForTransactionReceipt({ hash: txHash2 });

const finalX = await counter.read.x();
console.log("📊 最终 x 值:", finalX);

console.log("\n✨ 完成！");

