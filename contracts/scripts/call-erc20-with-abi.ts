import { network } from "hardhat";
import { formatEther, parseAbi, getContract } from "viem";

// ========== 配置：修改这里的值 ==========
const CONTRACT_ADDRESS = "0x123c6cf2afa3acdf990a559671b0e34bf45ff64a" as `0x${string}`;
const NETWORK = "bscTestnet"; // BSC 测试网
const mintAmount = 1000n; // 要铸造的代币数量（原始值，不含精度）
const mintToAddress = "0xaf082ed8d815feb0161aaa0e70cabf68a893cd05" as `0x${string}`;

// ========== 定义 ABI（仅使用 ABI，不依赖合约文件） ==========
// 使用 parseAbi 更简洁，类型也更安全
const ERC20_ABI = parseAbi([
  // 读取函数（view/pure）
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function owner() view returns (address)",
  
  // 写入函数（需要发送交易）
  "function mint(address to, uint256 amount) returns (bool)",
  "function burn(uint256 amount)",
  "function transfer(address to, uint256 amount) returns (bool)",
  
  // 事件
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Mint(address indexed to, uint256 amount)",
]);

// ========== 连接网络 ==========
const { viem } = await network.connect({
  network: NETWORK,
  chainType: "l1",
});

// 读取链上数据与广播交易的“公共 RPC 客户端”（无需私钥）
const publicClient = await viem.getPublicClient();
// 带账户与私钥的“签名客户端”，用于发起需要签名的写操作
const [walletClient] = await viem.getWalletClients();

// ========== 使用 ABI 获取合约实例（不需要合约文件） ==========
console.log("📜 合约地址:", CONTRACT_ADDRESS);
console.log("📋 使用手动定义的 ABI 连接合约\n");

// 使用 getContract 并传入 ABI（推荐方式）
// 使用纯viem库，需要手动传入publicClient和walletClient
const token = getContract({
  address: CONTRACT_ADDRESS,
  abi: ERC20_ABI,
  client: { public: publicClient, wallet: walletClient },
});

// ========== 读取合约状态（view 函数） ==========
console.log("📖 读取合约状态（使用 ABI）:");
try {
  const name = await token.read.name();
  console.log("   name =", name);

  const symbol = await token.read.symbol();
  console.log("   symbol =", symbol);

  const decimals = await token.read.decimals();
  console.log("   decimals =", decimals);

  const totalSupply = await token.read.totalSupply();
  console.log("   totalSupply =", formatEther(totalSupply as bigint), symbol);

  const owner = await token.read.owner();
  console.log("   owner =", owner);

  const balance = await token.read.balanceOf([mintToAddress]);
  console.log(`   balanceOf(${mintToAddress}) =`, formatEther(balance as bigint), symbol);
} catch (error) {
  console.error("   ❌ 读取失败:", error);
}

// ========== 写入合约状态（需要发送交易） ==========
// 注意：这部分代码已注释，如需使用请取消注释
console.log(`\n✍️  调用 mint() 函数（使用 ABI）:`);
console.log(`   目标地址: ${mintToAddress}`);
console.log(`   铸造数量: ${mintAmount} ${await token.read.symbol()}`);

try {
  // 获取精度
  const decimals = await token.read.decimals();
  const amountWithDecimals = mintAmount * 10n ** BigInt(decimals);
  console.log(`   实际数量（含精度）: ${amountWithDecimals}`);

  // 发送交易
  const txHash = await token.write.mint([mintToAddress, amountWithDecimals]);
  console.log("   交易哈希:", txHash);

  // 等待交易确认
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log("   ✅ 交易已确认");
  console.log("   区块号:", receipt.blockNumber);

  // 读取新值
  const newTotalSupply = await token.read.totalSupply();
  const newBalance = await token.read.balanceOf([mintToAddress]);
  console.log("\n📊 更新后的状态:");
  console.log("   totalSupply =", formatEther(newTotalSupply as bigint), await token.read.symbol());
  console.log(`   balanceOf(${mintToAddress}) =`, formatEther(newBalance as bigint), await token.read.symbol());

  // ========== 查询事件（使用 ABI） ==========
  console.log("\n🔍 查询 Mint 事件:");
  try {
    const mintEvents = await publicClient.getContractEvents({
      address: CONTRACT_ADDRESS,
      abi: ERC20_ABI,
      eventName: "Mint",
      fromBlock: receipt.blockNumber - 5n,
      toBlock: receipt.blockNumber,
    });
    console.log(`   找到 ${mintEvents.length} 个 Mint 事件`);
    mintEvents.forEach((event, index) => {
      console.log(`   事件 ${index + 1}:`, {
        to: event.args.to,
        amount: event.args.amount?.toString(),
        blockNumber: event.blockNumber,
      });
    });
  } catch (error) {
    console.log("   ⚠️  事件查询失败（可能因为 RPC 限制）:", error);
  }
} catch (error) {
  console.error("   ❌ 交易失败:", error);
  throw error;
}

console.log("\n✨ 完成！");
console.log("\n💡 关键点：");
console.log("   1. 只需要 ABI，不需要合约源文件");
console.log("   2. 使用 parseAbi() 定义 ABI 更简洁且类型安全");
console.log("   3. 使用 getContract() 连接合约（推荐方式）");
console.log("   4. viem 根据 ABI 自动编码/解码参数和返回值");

