import { network } from "hardhat";
import { formatEther, parseEther } from "viem";

async function main() {
  const { viem } = await network.connect({
    network: "bscTestnet",
    chainType: "l1",
  });

  const publicClient = await viem.getPublicClient();
  const [deployer, ...otherWallets] = await viem.getWalletClients();
  const envFeeRecipient = process.env.FEE_RECIPIENT_ADDRESS as `0x${string}` | undefined;
  const feeRecipientAddress = (envFeeRecipient || otherWallets[0]?.account.address || deployer.account.address) as `0x${string}`;

  console.log("部署者地址:", deployer.account.address);
  console.log("手续费接收地址:", feeRecipientAddress);
  const deployerBalance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("部署者余额:", formatEther(deployerBalance), "BNB");

  // 配置参数
  const tokenName = "Fee Token";
  const tokenSymbol = "FEE";
  const totalSupply = 1000000n; // 100万代币
  const decimals = 18;
  const nativeFeeAmount = parseEther("0.0001"); // 每次转账收取 0.001 BNB

  console.log("\n部署 ERC20WithNativeFee 合约...");
  console.log("代币名称:", tokenName);
  console.log("代币符号:", tokenSymbol);
  console.log("总供应量:", totalSupply.toString());
  console.log("手续费金额:", formatEther(nativeFeeAmount), "BNB");

  const token = await viem.deployContract("ERC20WithNativeFee", [
    tokenName,
    tokenSymbol,
    totalSupply,
    decimals,
    feeRecipientAddress,
    nativeFeeAmount,
  ]);

  console.log("\n✅ 合约部署成功!");
  console.log("合约地址:", token.address);
  const feeRecipientAddr = await token.read.feeRecipient();
  const feeAmount = await token.read.nativeFeeAmount();
  console.log("手续费接收地址:", feeRecipientAddr);
  console.log("手续费金额:", formatEther(feeAmount as bigint), "BNB");

  // 验证部署者的代币余额
  const deployerTokenBalance = await token.read.balanceOf([deployer.account.address]);
  console.log("\n部署者代币余额:", formatEther(deployerTokenBalance as bigint), tokenSymbol);

  return token.address;
}

main()
  .then((address) => {
    console.log("\n合约地址:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

