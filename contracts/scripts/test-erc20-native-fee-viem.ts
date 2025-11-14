import { parseAbi, formatEther, parseEther, getContract, createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from "viem/chains";

// 配置：替换为你的合约地址
const CONTRACT_ADDRESS = "0x你的合约地址" as `0x${string}`;

// ERC20WithNativeFee 合约的 ABI（简化版，仅包含必要函数）
const ERC20_NATIVE_FEE_ABI = parseAbi([
  "function transfer(address to, uint256 amount) payable returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) payable returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function nativeFeeAmount() view returns (uint256)",
  "function getRequiredFee(address from, address to) view returns (uint256)",
  "function feeExempt(address account) view returns (bool)",
  "function feeRecipient() view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event NativeFeeCollected(address indexed from, address indexed to, uint256 feeAmount)",
]);

async function main() {
  // 从环境变量获取配置
  const rpcUrl = process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.bnbchain.org:8545";
  const privateKey = process.env.BSC_TESTNET_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("请在 .env.local 中设置 BSC_TESTNET_PRIVATE_KEY");
  }

  const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, "")}` as `0x${string}`);
  
  // 创建客户端
  const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: bscTestnet,
    transport: http(rpcUrl),
  });

  console.log("发送者地址:", account.address);

  // 获取合约实例
  const token = getContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_NATIVE_FEE_ABI,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });

  // 查询合约信息
  const feeRecipient = await token.read.feeRecipient();
  const nativeFeeAmount = (await token.read.nativeFeeAmount()) as bigint;

  console.log("手续费接收地址:", feeRecipient);
  console.log("固定手续费金额:", formatEther(nativeFeeAmount), "BNB");

  // 生成一个测试接收地址（或使用配置的地址）
  const recipientAddress = process.env.RECIPIENT_ADDRESS as `0x${string}` || account.address;
  console.log("接收者地址:", recipientAddress);

  // 查询是否需要支付手续费
  const requiredFee = (await token.read.getRequiredFee([account.address, recipientAddress])) as bigint;
  const isExempt = (await token.read.feeExempt([account.address])) as boolean;

  console.log("\n手续费信息:");
  console.log("是否免手续费:", isExempt);
  console.log("本次转账所需手续费:", formatEther(requiredFee), "BNB");

  // 查询余额
  const senderBalanceBefore = (await token.read.balanceOf([account.address])) as bigint;
  const recipientBalanceBefore = (await token.read.balanceOf([recipientAddress])) as bigint;
  const feeRecipientBalanceBefore = await publicClient.getBalance({ address: feeRecipient });

  console.log("\n转账前余额:");
  console.log("发送者代币余额:", formatEther(senderBalanceBefore));
  console.log("接收者代币余额:", formatEther(recipientBalanceBefore));
  console.log("手续费接收者 BNB 余额:", formatEther(feeRecipientBalanceBefore));

  // 转账金额
  const transferAmount = parseEther("100"); // 转账 100 个代币

  console.log("\n执行转账:", formatEther(transferAmount), "代币");
  console.log("需要支付手续费:", formatEther(nativeFeeAmount), "BNB");

  try {
    // 执行转账（需要同时发送原生代币作为手续费）
    const txHash = await token.write.transfer([recipientAddress, transferAmount], {
      value: nativeFeeAmount, // 支付原生代币手续费
    });

    console.log("交易哈希:", txHash);
    
    // 等待交易确认
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log("交易确认，区块号:", receipt.blockNumber);

    // 查询转账后余额
    const senderBalanceAfter = (await token.read.balanceOf([account.address])) as bigint;
    const recipientBalanceAfter = (await token.read.balanceOf([recipientAddress])) as bigint;
    const feeRecipientBalanceAfter = await publicClient.getBalance({ address: feeRecipient });

    console.log("\n转账后余额:");
    console.log("发送者代币余额:", formatEther(senderBalanceAfter));
    console.log("接收者代币余额:", formatEther(recipientBalanceAfter));
    console.log("手续费接收者 BNB 余额:", formatEther(feeRecipientBalanceAfter));

    console.log("\n✅ 转账成功!");
    console.log("代币变化:", formatEther(senderBalanceBefore - senderBalanceAfter));
    console.log("手续费变化:", formatEther(feeRecipientBalanceAfter - feeRecipientBalanceBefore), "BNB");

    // 查询手续费收集事件
    const feeEvents = await publicClient.getContractEvents({
      address: CONTRACT_ADDRESS,
      abi: ERC20_NATIVE_FEE_ABI,
      eventName: "NativeFeeCollected",
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    if (feeEvents.length > 0) {
      console.log("\n手续费收集事件:");
      feeEvents.forEach((event, index) => {
        console.log(`事件 ${index + 1}:`, {
          from: event.args.from,
          to: event.args.to,
          feeAmount: formatEther(event.args.feeAmount as bigint),
        });
      });
    }
  } catch (error: any) {
    console.error("转账失败:", error.message);
    if (error.message?.includes("Insufficient native token")) {
      console.error("提示: 请确保发送者有足够的 BNB 支付手续费");
    }
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

