import { network } from "hardhat";
import { formatEther } from "viem";

async function main() {
    console.log("🔍 解释 Hardhat 如何识别部署者...\n");

    const { viem } = await network.connect({
        network: "bscTestnet",
        chainType: "l1",
    });

    // 1. 获取所有可用的钱包客户端
    const walletClients = await viem.getWalletClients();
    console.log("📋 可用的钱包客户端数量:", walletClients.length);
    
    // 2. 第一个钱包客户端就是部署者
    const [deployer] = walletClients;
    console.log("📍 部署者地址:", deployer.account.address);
    console.log("🔑 部署者私钥来源: 环境变量 BSC_TESTNET_PRIVATE_KEY");
    
    // 3. 检查部署者余额
    const publicClient = await viem.getPublicClient();
    const balance = await publicClient.getBalance({ address: deployer.account.address });
    console.log("💰 部署者余额:", formatEther(balance), "BNB");
    
    // 4. 显示网络信息
    const chainId = await publicClient.getChainId();
    console.log("⛓️  网络 Chain ID:", chainId);
    console.log("🌐 网络类型:", chainId === 97 ? "BSC 测试网" : "其他网络");
    
    console.log("\n📝 部署者识别过程:");
    console.log("1. Hardhat 读取 .env.local 中的 BSC_TESTNET_PRIVATE_KEY");
    console.log("2. 从私钥生成钱包客户端 (包含地址和签名能力)");
    console.log("3. 第一个钱包客户端成为部署者");
    console.log("4. 部署合约时，msg.sender = 部署者地址");
    
    console.log("\n🔐 安全说明:");
    console.log("✅ 私钥存储在本地 .env.local 文件中");
    console.log("✅ 私钥不会上传到代码仓库");
    console.log("✅ 只有本地环境可以访问私钥");
    
    console.log("\n🎯 在合约中:");
    console.log("constructor() {");
    console.log("    // msg.sender 就是部署者地址");
    console.log("    _mint(msg.sender, 1000000 * 10**18);");
    console.log("}");
    
    console.log("\n💡 总结:");
    console.log("- 部署者 = 私钥对应的地址");
    console.log("- 私钥来源 = 环境变量 BSC_TESTNET_PRIVATE_KEY");
    console.log("- 合约中的 msg.sender = 部署者地址");
    console.log("- 初始代币自动给部署者");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
