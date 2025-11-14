import { network } from "hardhat";

console.log("🚀 部署 Counter 合约到 BSC 测试网...\n");

// 连接到 BSC 测试网
const { viem } = await network.connect({
  network: "bscTestnet",
  chainType: "l1",
});

const publicClient = await viem.getPublicClient();
const [walletClient] = await viem.getWalletClients();

console.log("📍 部署账户:", walletClient.account.address);

// 检查余额
const balance = await publicClient.getBalance({ address: walletClient.account.address });
console.log(`💰 账户余额: ${Number(balance) / 1e18} BNB`);

if (balance === 0n) {
  console.log("\n❌ 余额不足！请先从水龙头获取测试 BNB:");
  console.log("   https://testnet.bnbchain.org/faucet-smart");
  process.exit(1);
}

console.log();

// 部署合约
console.log("⏳ 正在部署 Counter 合约...");
const counter = await viem.deployContract("Counter");

console.log("\n✅ 合约部署成功！");
console.log(`📜 合约地址: ${counter.address}`);
console.log(`🔗 查看合约: https://testnet.bscscan.com/address/${counter.address}`);
console.log();

// 测试合约
console.log("🧪 测试合约调用...");
const initialValue = await counter.read.x();
console.log(`   初始值 x = ${initialValue}`);

console.log("   调用 inc()...");
const txHash = await counter.write.inc();
await publicClient.waitForTransactionReceipt({ hash: txHash });

const newValue = await counter.read.x();
console.log(`   新值 x = ${newValue}`);

console.log();
console.log("✨ 部署完成！");
console.log();
console.log("📝 复制以下地址到你的调用脚本中：");
console.log(`   ${counter.address}`);
console.log();
console.log("💡 验证合约（可选）：");
console.log(`   npx hardhat verify --network bscTestnet ${counter.address}`);

