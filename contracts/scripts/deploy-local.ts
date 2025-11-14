import { network } from "hardhat";

console.log("🚀 部署 Counter 合约到本地网络...\n");

// 连接到本地网络（需要先启动 hardhat node）
const { viem } = await network.connect({
  network: "localhost",
  chainType: "l1",
});

const [walletClient] = await viem.getWalletClients();

console.log("📍 部署账户:", walletClient.account.address);
console.log();

// 部署合约
console.log("⏳ 正在部署 Counter 合约...");
const counter = await viem.deployContract("Counter");

console.log("✅ 合约部署成功！");
console.log(`📜 合约地址: ${counter.address}`);
console.log();
console.log("💡 使用以下地址来调用合约：");
console.log(`   ${counter.address}`);
console.log();
console.log("📝 运行调用脚本：");
console.log(`   npx hardhat run scripts/quick-call.ts --network localhost`);
console.log();

// 测试调用
console.log("🧪 测试合约调用...");
const initialValue = await counter.read.x();
console.log(`   初始值 x = ${initialValue}`);

await counter.write.inc();
const newValue = await counter.read.x();
console.log(`   调用 inc() 后 x = ${newValue}`);

console.log();
console.log("✨ 完成！合约已部署并可以使用。");

