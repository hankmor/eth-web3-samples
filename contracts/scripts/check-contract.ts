import { network } from "hardhat";

const ADDRESS = "0x84f899c674db5ab1f8f190d2007ae4003e2dda75" as `0x${string}`;

console.log("🔍 检查合约地址...\n");
console.log(`📍 地址: ${ADDRESS}`);

const { viem } = await network.connect({
  network: "bscTestnet",
  chainType: "l1",
});

const publicClient = await viem.getPublicClient();

// 检查链信息
const chainId = await publicClient.getChainId();
console.log(`⛓️  连接的 Chain ID: ${chainId}`);
console.log(`   ${chainId === 97 ? "✅ BSC 测试网" : "❌ 不是 BSC 测试网！"}\n`);

// 检查地址是否有代码
const code = await publicClient.getCode({ address: ADDRESS });

if (!code || code === "0x") {
  console.log("❌ 该地址上没有合约代码！");
  console.log("   可能原因：");
  console.log("   1. 这是一个普通地址（EOA），不是合约地址");
  console.log("   2. 合约从未部署到这个地址");
  console.log("   3. 网络连接错误\n");
  console.log("💡 建议：重新部署合约");
} else {
  console.log("✅ 该地址上有合约代码");
  console.log(`📝 代码长度: ${code.length} 字节`);
  console.log(`🔗 查看: https://testnet.bscscan.com/address/${ADDRESS}\n`);
  
  // 尝试读取余额
  const balance = await publicClient.getBalance({ address: ADDRESS });
  console.log(`💰 合约余额: ${balance} wei`);
}

// 检查账户余额
const [walletClient] = await viem.getWalletClients();
const myBalance = await publicClient.getBalance({ address: walletClient.account.address });
console.log(`\n👛 你的账户余额: ${Number(myBalance) / 1e18} BNB`);

if (myBalance === 0n) {
  console.log("⚠️  余额为 0，请从水龙头获取测试 BNB:");
  console.log("   https://testnet.bnbchain.org/faucet-smart");
}

