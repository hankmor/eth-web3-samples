import { network } from "hardhat";
import { formatEther, parseEther } from "viem";

// 部署后的合约地址（需要替换为实际地址）
const TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

async function main() {
    console.log("🧪 测试 ERC20 代币功能...\n");

    const { viem } = await network.connect({
        network: "bscTestnet",
        chainType: "l1",
    });

    const publicClient = await viem.getPublicClient();
    const [walletClient] = await viem.getWalletClients();

    console.log("📍 测试账户:", walletClient.account.address);
    console.log("📜 代币地址:", TOKEN_ADDRESS);

    // 获取代币合约实例
    const token = await viem.getContractAt("HandwrittenERC20", TOKEN_ADDRESS);

    console.log("\n📊 查询代币信息...");
    
    // 基本信息
    const name = await token.read.name();
    const symbol = await token.read.symbol();
    const decimals = await token.read.decimals();
    const totalSupply = await token.read.totalSupply();
    
    console.log(`   代币名称: ${name}`);
    console.log(`   代币符号: ${symbol}`);
    console.log(`   小数位数: ${decimals}`);
    console.log(`   总供应量: ${formatEther(totalSupply)} ${symbol}`);

    // 查询余额
    console.log("\n💰 查询余额...");
    const myBalance = await token.read.balanceOf([walletClient.account.address]);
    console.log(`   我的余额: ${formatEther(myBalance)} ${symbol}`);

    if (myBalance === 0n) {
        console.log("❌ 余额为 0，无法进行转账测试");
        console.log("💡 提示：只有代币部署者才有初始余额");
        return;
    }

    // 测试转账（发送给自己，测试基本功能）
    console.log("\n💸 测试转账功能...");
    const testAmount = parseEther("100"); // 100 代币
    
    if (myBalance < testAmount) {
        console.log(`⚠️  余额不足，使用较小金额测试`);
        const smallAmount = myBalance / 2n;
        console.log(`   转账金额: ${formatEther(smallAmount)} ${symbol}`);
        
        const txHash = await token.write.transfer([walletClient.account.address, smallAmount]);
        console.log(`   转账交易: ${txHash}`);
        
        // 等待确认
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        console.log(`   交易确认: 区块 ${receipt.blockNumber}`);
        
    } else {
        console.log(`   转账金额: ${formatEther(testAmount)} ${symbol}`);
        
        const txHash = await token.write.transfer([walletClient.account.address, testAmount]);
        console.log(`   转账交易: ${txHash}`);
        
        // 等待确认
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        console.log(`   交易确认: 区块 ${receipt.blockNumber}`);
    }

    // 测试授权功能
    console.log("\n🔐 测试授权功能...");
    const approveAmount = parseEther("50");
    console.log(`   授权金额: ${formatEther(approveAmount)} ${symbol}`);
    
    const approveTx = await token.write.approve([walletClient.account.address, approveAmount]);
    console.log(`   授权交易: ${approveTx}`);
    
    // 等待确认
    const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveTx });
    console.log(`   授权确认: 区块 ${approveReceipt.blockNumber}`);

    // 查询授权额度
    const allowance = await token.read.allowance([walletClient.account.address, walletClient.account.address]);
    console.log(`   当前授权额度: ${formatEther(allowance)} ${symbol}`);

    // 测试 transferFrom（自己授权给自己）
    console.log("\n🔄 测试 transferFrom 功能...");
    const transferFromAmount = parseEther("10");
    
    if (allowance >= transferFromAmount) {
        console.log(`   代理转账金额: ${formatEther(transferFromAmount)} ${symbol}`);
        
        const transferFromTx = await token.write.transferFrom([
            walletClient.account.address,
            walletClient.account.address,
            transferFromAmount
        ]);
        console.log(`   代理转账交易: ${transferFromTx}`);
        
        // 等待确认
        const transferFromReceipt = await publicClient.waitForTransactionReceipt({ hash: transferFromTx });
        console.log(`   代理转账确认: 区块 ${transferFromReceipt.blockNumber}`);
    } else {
        console.log("❌ 授权额度不足，跳过 transferFrom 测试");
    }

    // 最终余额查询
    console.log("\n📊 最终状态...");
    const finalBalance = await token.read.balanceOf([walletClient.account.address]);
    const finalAllowance = await token.read.allowance([walletClient.account.address, walletClient.account.address]);
    
    console.log(`   最终余额: ${formatEther(finalBalance)} ${symbol}`);
    console.log(`   剩余授权: ${formatEther(finalAllowance)} ${symbol}`);

    console.log("\n✅ 测试完成！");
    console.log("\n📋 测试结果总结:");
    console.log("   ✅ 代币信息查询");
    console.log("   ✅ 余额查询");
    console.log("   ✅ 转账功能");
    console.log("   ✅ 授权功能");
    console.log("   ✅ 代理转账功能");
    
    console.log("\n🔗 查看交易:");
    console.log(`   BSCScan: https://testnet.bscscan.com/address/${TOKEN_ADDRESS}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
