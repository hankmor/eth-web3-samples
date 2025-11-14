import { network } from "hardhat";
import { formatEther, parseEther, getContract } from "viem";

// 配置：替换为你的合约地址
const CONTRACT_ADDRESS = "0x你的合约地址" as `0x${string}`;

// ERC20WithNativeFee 合约的 ABI
const ERC20_NATIVE_FEE_ABI = [
  "function transfer(address to, uint256 amount) payable returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function nativeFeeAmount() view returns (uint256)",
  "function getRequiredFee(address from, address to) view returns (uint256)",
] as const;

async function main() {
  const { viem } = await network.connect({
    network: "bscTestnet",
    chainType: "l1",
  });

  const publicClient = await viem.getPublicClient();
  const [sender, recipient, feeRecipient] = await viem.getWalletClients();

  console.log("发送者地址:", sender.account.address);
  console.log("接收者地址:", recipient.account.address);
  console.log("手续费接收地址:", feeRecipient.account.address);

  const token = getContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_NATIVE_FEE_ABI,
    client: {
      public: publicClient,
      wallet: sender,
    },
  });

  // 查询手续费金额
  const nativeFeeAmount = (await token.read.nativeFeeAmount()) as bigint;
  const requiredFee = (await token.read.getRequiredFee([sender.account.address, recipient.account.address])) as bigint;

  console.log("\n手续费信息:");
  console.log("固定手续费:", formatEther(nativeFeeAmount), "BNB");
  console.log("本次转账所需手续费:", formatEther(requiredFee), "BNB");

  // 查询余额
  const senderBalanceBefore = (await token.read.balanceOf([sender.account.address])) as bigint;
  const recipientBalanceBefore = (await token.read.balanceOf([recipient.account.address])) as bigint;
  const feeRecipientBalanceBefore = await publicClient.getBalance({ address: feeRecipient.account.address });

  console.log("\n转账前余额:");
  console.log("发送者代币余额:", formatEther(senderBalanceBefore));
  console.log("接收者代币余额:", formatEther(recipientBalanceBefore));
  console.log("手续费接收者 BNB 余额:", formatEther(feeRecipientBalanceBefore));

  // 转账金额
  const transferAmount = parseEther("100"); // 转账 100 个代币

  console.log("\n执行转账:", formatEther(transferAmount), "代币");
  console.log("需要支付手续费:", formatEther(nativeFeeAmount), "BNB");

  // 执行转账（需要同时发送原生代币作为手续费）
  const txHash = await token.write.transfer([recipient.account.address, transferAmount], {
    value: nativeFeeAmount, // 支付原生代币手续费
  });

  console.log("交易哈希:", txHash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log("交易确认，区块号:", receipt.blockNumber);

  // 查询转账后余额
  const senderBalanceAfter = (await token.read.balanceOf([sender.account.address])) as bigint;
  const recipientBalanceAfter = (await token.read.balanceOf([recipient.account.address])) as bigint;
  const feeRecipientBalanceAfter = await publicClient.getBalance({ address: feeRecipient.account.address });

  console.log("\n转账后余额:");
  console.log("发送者代币余额:", formatEther(senderBalanceAfter));
  console.log("接收者代币余额:", formatEther(recipientBalanceAfter));
  console.log("手续费接收者 BNB 余额:", formatEther(feeRecipientBalanceAfter));

  console.log("\n✅ 转账成功!");
  console.log("代币变化:", formatEther(senderBalanceBefore - senderBalanceAfter), "→", formatEther(senderBalanceAfter));
  console.log("手续费变化:", formatEther(feeRecipientBalanceAfter - feeRecipientBalanceBefore), "BNB");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

