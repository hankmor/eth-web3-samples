import { network } from "hardhat";

const CONTRACT_ADDRESS = "0x38cf6e1639c9c37b7b29308af958cbe8fbe03917" as `0x${string}`;

console.log("🔍 获取链上字节码...\n");

const { viem } = await network.connect({
  network: "bscTestnet",
  chainType: "l1",
});

const publicClient = await viem.getPublicClient();

// 获取链上字节码
const deployedBytecode = await publicClient.getCode({ address: CONTRACT_ADDRESS });

console.log(`📝 链上字节码长度: ${deployedBytecode?.length || 0} 字符`);
console.log(`📝 前 100 个字符: ${deployedBytecode?.slice(0, 100)}...`);

// 读取本地编译的字节码
const counterArtifact = await import("../artifacts/contracts/Counter.sol/Counter.json", {
  assert: { type: "json" },
});

const localBytecode = counterArtifact.default.deployedBytecode as string;
console.log(`\n📦 本地字节码长度: ${localBytecode.length} 字符`);
console.log(`📦 前 100 个字符: ${localBytecode.slice(0, 100)}...`);

// 比较（处理 0x 前缀）
const normalizedDeployed = deployedBytecode?.toLowerCase() || "";
const normalizedLocal = (localBytecode.startsWith("0x") ? localBytecode : `0x${localBytecode}`).toLowerCase();

console.log("\n🔬 详细比较：");
console.log(`链上字节码是否以 0x 开头: ${normalizedDeployed.startsWith("0x")}`);
console.log(`本地字节码是否以 0x 开头: ${normalizedLocal.startsWith("0x")}`);

// 移除 metadata hash 后比较（Solidity 会在字节码末尾添加 metadata hash）
// Metadata hash 通常在最后 53 个字节（106 个字符）
const deployedWithoutMetadata = normalizedDeployed.slice(0, -106);
const localWithoutMetadata = normalizedLocal.slice(0, -106);

console.log(`\n去除 metadata 后的长度:`);
console.log(`  链上: ${deployedWithoutMetadata.length}`);
console.log(`  本地: ${localWithoutMetadata.length}`);

if (normalizedDeployed === normalizedLocal) {
  console.log("\n✅ 字节码完全匹配（包括 metadata）！");
  console.log("\n执行验证命令：");
  console.log(`npx hardhat verify --network bscTestnet ${CONTRACT_ADDRESS}`);
} else if (deployedWithoutMetadata === localWithoutMetadata) {
  console.log("\n⚠️  字节码匹配（不包括 metadata hash）");
  console.log("这是正常的，因为 Solidity 编译器会添加不同的 metadata hash");
  console.log("\n✅ 可以验证！执行命令：");
  console.log(`npx hardhat verify --network bscTestnet ${CONTRACT_ADDRESS}`);
} else {
  console.log("\n❌ 字节码不匹配！");
  
  // 找出第一个不同的位置
  let firstDiff = -1;
  for (let i = 0; i < Math.min(normalizedDeployed.length, normalizedLocal.length); i++) {
    if (normalizedDeployed[i] !== normalizedLocal[i]) {
      firstDiff = i;
      break;
    }
  }
  
  if (firstDiff >= 0) {
    console.log(`\n第一个不同的位置在索引 ${firstDiff}:`);
    console.log(`  链上: ...${normalizedDeployed.slice(Math.max(0, firstDiff - 20), firstDiff + 20)}...`);
    console.log(`  本地: ...${normalizedLocal.slice(Math.max(0, firstDiff - 20), firstDiff + 20)}...`);
  }
  
  console.log("\n可能原因：");
  console.log("  1. 部署时使用了不同的 optimizer 设置");
  console.log("  2. Solidity 版本不同");
  console.log("  3. 合约代码有修改");
  console.log("\n💡 解决方案：");
  console.log("  1. 重新部署合约（推荐）");
  console.log("  2. 尝试修改 hardhat.config.ts 中的 optimizer 设置");
}

