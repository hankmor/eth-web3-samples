import { network } from "hardhat";

const { viem } = await network.connect({
  network: "hardhatOp", // 本地模拟的OP网络
  chainType: "op",
});

console.log("Sending transaction using the OP chain type");

// 获取公共客户端
const publicClient = await viem.getPublicClient();

// 获取发送者客户端, 返回一个数组，数组中包含一个发送者客户端和一个接收者客户端的账户(这里没用到)
const [senderClient] = await viem.getWalletClients();

console.log("Sending 1 wei from", senderClient.account.address, "to itself");

// 估算L1 gas
const l1Gas = await publicClient.estimateL1Gas({
  account: senderClient.account.address,
  to: senderClient.account.address,
  value: 1n,
});

console.log("Estimated L1 gas:", l1Gas);

console.log("Sending L2 transaction");
// 发送L2交易
const tx = await senderClient.sendTransaction({
  to: senderClient.account.address,
  value: 1n,
});

// 等待交易接收
await publicClient.waitForTransactionReceipt({ hash: tx });

console.log("Transaction sent successfully");
