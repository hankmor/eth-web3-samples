import { network } from "hardhat";

// ========== 配置：修改这里的值 ==========
const CONTRACT_ADDRESS = "0x123c6cf2afa3acdf990a559671b0e34bf45ff64a" as `0x${string}`;
const NETWORK = "bscTestnet"; // BSC 测试网
const burnAmount = 10000n;

// ========== 连接合约 ==========
const { viem } = await network.connect({
  network: NETWORK,
  chainType: "l1",
});

// 通过合约名称和地址获取合约实例（需要在 contracts/ 目录中有对应的 .sol 文件）
const mintableERC20 = await viem.getContractAt("MintableBurnableToken", CONTRACT_ADDRESS);

console.log("📜 合约地址:", mintableERC20.address);

// ========== 读取合约状态（免费，不消耗 gas） ==========
console.log("\n📖 读取合约状态:");
const currentTotalSupply = await mintableERC20.read.totalSupply();
console.log("   totalSupply =", currentTotalSupply);
const decimals = await mintableERC20.read.decimals();
console.log("   decimals =", decimals);

// ========== 写入合约状态（需要支付 gas） ==========
// 确保调用者有足够的token
console.log(`\n✍️  调用 burn() 函数, 再burn ${burnAmount} 个token`);
const txHash = await mintableERC20.write.burn([burnAmount * 10n ** BigInt(decimals as number)]);
console.log("   交易哈希:", txHash);

// 等待交易确认
const publicClient = await viem.getPublicClient();
await publicClient.waitForTransactionReceipt({ hash: txHash });
console.log("   ✅ 交易已确认");

// 读取新值
const newTotalSupply = await mintableERC20.read.totalSupply();
console.log("\n📊 新的 totalSupply 值:", newTotalSupply);

console.log("\n✨ 完成！");