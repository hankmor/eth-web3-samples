import { network } from "hardhat";
import { formatEther, parseEther } from "viem";

console.log("🚀 开始 BSC 测试网测试...\n");

// 连接到 BSC 测试网
const { viem } = await network.connect({
  network: "bscTestnet",
  chainType: "l1",
});

// 获取公共客户端和钱包客户端
const publicClient = await viem.getPublicClient();
const [walletClient] = await viem.getWalletClients();

const myAddress = walletClient.account.address;

console.log("📍 当前账户:", myAddress);

// 1. 查询账户余额
console.log("\n=== 1. 查询账户余额 ===");
const balance = await publicClient.getBalance({ address: myAddress });
console.log(`💰 BNB 余额: ${formatEther(balance)} BNB`);

if (balance === 0n) {
  console.log("⚠️  余额为 0，请先从水龙头获取测试 BNB:");
  console.log("   https://testnet.bnbchain.org/faucet-smart");
  process.exit(1);
}

// 2. 查询链信息
console.log("\n=== 2. 链信息 ===");
const chainId = await publicClient.getChainId();
const blockNumber = await publicClient.getBlockNumber();
const gasPrice = await publicClient.getGasPrice();

console.log(`⛓️  Chain ID: ${chainId}`);
console.log(`📦 当前区块高度: ${blockNumber}`);
console.log(`⛽ 当前 Gas Price: ${formatEther(gasPrice)} BNB (${gasPrice} wei)`);

// 3. 发送一笔简单的转账交易
console.log("\n=== 3. 发送转账交易 ===");

// 接收地址：可以从环境变量读取，或者默认发送给自己
const recipientAddress = (process.env.BSC_RECIPIENT_ADDRESS as `0x${string}`) || myAddress;
console.log(`💸 发送 0.001 BNB 从 ${myAddress} 到 ${recipientAddress}...`);

const txHash = await walletClient.sendTransaction({
  to: recipientAddress as `0x${string}`,
  value: parseEther("0.001"),
});

console.log(`📝 交易哈希: ${txHash}`);
console.log(`🔗 查看交易: https://testnet.bscscan.com/tx/${txHash}`);

// 等待交易确认
console.log("⏳ 等待交易确认...");
const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

console.log(`✅ 交易已确认！`);
console.log(`   区块号: ${receipt.blockNumber}`);
console.log(`   Gas 使用: ${receipt.gasUsed}`);
console.log(`   状态: ${receipt.status === "success" ? "成功" : "失败"}`);

// 4. 部署 Counter 合约
console.log("\n=== 4. 部署 Counter 合约 ===");
const counter = await viem.deployContract("Counter");

console.log(`📜 合约地址: ${counter.address}`);
console.log(`🔗 查看合约: https://testnet.bscscan.com/address/${counter.address}`);
console.log(`\n💡 提示：合约部署后，可以使用以下命令验证合约源代码：`);
console.log(`   npx hardhat verify --network bscTestnet ${counter.address}`);

// 5. 与合约交互
console.log("\n=== 5. 与合约交互 ===");

// 读取初始值
const initialValue = await counter.read.x();
console.log(`📊 Counter 初始值: ${initialValue}`);

// 调用 inc() 函数
console.log("➕ 调用 inc() 增加计数...");
const incTxHash = await counter.write.inc();
console.log(`📝 交易哈希: ${incTxHash}`);

await publicClient.waitForTransactionReceipt({ hash: incTxHash });
console.log("✅ inc() 调用成功");

// 读取新值
const newValue = await counter.read.x();
console.log(`📊 Counter 新值: ${newValue}`);

// 调用 incBy() 函数
console.log("\n➕ 调用 incBy(5) 增加 5...");
const incByTxHash = await counter.write.incBy([5n]);
console.log(`📝 交易哈希: ${incByTxHash}`);

await publicClient.waitForTransactionReceipt({ hash: incByTxHash });
console.log("✅ incBy(5) 调用成功");

// 读取最终值
const finalValue = await counter.read.x();
console.log(`📊 Counter 最终值: ${finalValue}`);

// 6. 查询合约事件
console.log("\n=== 6. 查询合约事件 ===");
const events = await publicClient.getContractEvents({
  address: counter.address,
  abi: counter.abi,
  eventName: "Increment",
  fromBlock: receipt.blockNumber,
});

console.log(`📋 共触发了 ${events.length} 个 Increment 事件:`);
events.forEach((event, index) => {
  console.log(`   事件 ${index + 1}: 增加了 ${event.args.by}`);
});

// 7. 最终余额
console.log("\n=== 7. 最终余额 ===");
const finalBalance = await publicClient.getBalance({ address: myAddress });
console.log(`💰 BNB 余额: ${formatEther(finalBalance)} BNB`);
console.log(`📉 消耗: ${formatEther(balance - finalBalance)} BNB`);

console.log("\n✨ BSC 测试网测试完成！");

