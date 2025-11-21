import { network } from "hardhat";
import { formatEther } from "viem";

async function main() {
    console.log("🚀 部署 ERC20 代币到 Sepolia...\n");

    const { viem } = await network.connect({
        network: "sepolia",
        chainType: "l1",
    });

    const publicClient = await viem.getPublicClient();
    const [deployer] = await viem.getWalletClients();

    console.log("📍 部署账户:", deployer.account.address);
    const balance = await publicClient.getBalance({ address: deployer.account.address });
    console.log("💰 账户余额:", formatEther(balance), "ETH");

    // 代币参数
    const tokenName = "My Test ETH";
    const tokenSymbol = "myETH";
    const totalSupply = 21_000_000n;
    const decimals = 18;
    
    console.log(`\n📝 代币信息:`);
    console.log(`   名称: ${tokenName}`);
    console.log(`   符号: ${tokenSymbol}`);
    console.log(`   初始供应量: ${totalSupply} ${tokenSymbol}`);

    console.log("\n⏳ 正在部署 ERC20 代币合约...");
    
    // 部署 MintableBurnableToken 合约（包含铸造功能，支持自定义参数）
    const token = await viem.deployContract("MintableBurnableToken", [
        tokenName,
        tokenSymbol,
        totalSupply,
        decimals,
    ]);

    console.log("\n✅ 代币部署成功！");
    console.log("📜 合约地址:", token.address);
    console.log(`🔗 查看合约: https://sepolia.etherscan.io/address/${token.address}`);

    // 测试基本功能
    console.log("\n🧪 测试代币功能...");
    
    // 查询部署者余额
    const deployerBalance = await token.read.balanceOf([deployer.account.address]);
    console.log(`   部署者余额: ${formatEther(deployerBalance as bigint)} ETH`);
    
    // 查询总供应量
    const readTotalSupply = await token.read.totalSupply();
    console.log(`   总供应量: ${formatEther(readTotalSupply as bigint)} ETH`);
    
    // 查询代币信息
    const name = await token.read.name();
    const symbol = await token.read.symbol();
    const readDecimals = await token.read.decimals();
    console.log(`   代币名称: ${name}`);
    console.log(`   代币符号: ${symbol}`);
    console.log(`   小数位数: ${readDecimals}`);

    // 测试转账（发送少量代币给部署者自己）
    console.log("\n💸 测试转账功能...");
    const testAmount = 100n
    const testAmountInWei = testAmount * 10n**BigInt(decimals);
    const txHash = await token.write.transfer([deployer.account.address, testAmountInWei]);
    console.log(`   转账交易: ${txHash}`);
    
    // 等待交易确认
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`   交易确认: 区块 ${receipt.blockNumber}`);

    console.log("\n✨ 部署完成！");
    console.log(`\n📝 代币信息:`);
    console.log(`   合约地址: ${token.address}`);
    console.log(`   代币名称: ${tokenName} (${tokenSymbol})`);
    console.log(`   总供应量: ${formatEther(readTotalSupply as bigint)} myETH`);
    console.log(`   部署者余额: ${formatEther(deployerBalance as bigint)} myETH`);
    
    console.log(`\n🔗 相关链接:`);
    console.log(`   Etherscan: https://sepolia.etherscan.io/address/${token.address}`);
    console.log(`   Sepolia 水龙头: https://sepoliafaucet.com/`);
    
    console.log(`\n💡 下一步操作:`);
    console.log(`   1. 验证合约: npx hardhat verify --network sepolia ${token.address}`);
    console.log(`   2. 添加代币到 MetaMask:`);
    console.log(`      - 网络: Sepolia`);
    console.log(`      - 合约地址: ${token.address}`);
    console.log(`      - 符号: ${tokenSymbol}`);
    console.log(`      - 小数: 18`);
    
    console.log(`\n🎯 测试建议:`);
    console.log(`   - 使用 Sepolia 水龙头获取测试 ETH`);
    console.log(`   - 在 MetaMask 中添加代币进行测试`);
    console.log(`   - 尝试转账、授权等 ERC20 功能`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// 合约地址: 0x84f899c674db5ab1f8f190d2007ae4003e2dda75
// 查看合约: https://sepolia.etherscan.io/address/0x84f899c674db5ab1f8f190d2007ae4003e2dda75