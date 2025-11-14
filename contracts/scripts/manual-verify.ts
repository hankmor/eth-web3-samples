import hre from "hardhat";

const CONTRACT_ADDRESS = "0x38cf6e1639c9c37b7b29308af958cbe8fbe03917";

console.log("🔍 手动验证合约...\n");
console.log(`合约地址: ${CONTRACT_ADDRESS}`);
console.log(`网络: BSC Testnet`);
console.log();

try {
  await hre.run("verify:verify", {
    address: CONTRACT_ADDRESS,
    constructorArguments: [], // Counter 合约没有构造函数参数
  });
  
  console.log("\n✅ 验证成功！");
  console.log(`🔗 查看: https://testnet.bscscan.com/address/${CONTRACT_ADDRESS}#code`);
} catch (error: any) {
  if (error.message.includes("Already Verified")) {
    console.log("\n✅ 合约已经验证过了！");
    console.log(`🔗 查看: https://testnet.bscscan.com/address/${CONTRACT_ADDRESS}#code`);
  } else {
    console.error("\n❌ 验证失败:");
    console.error(error.message);
    
    // 显示详细的错误信息
    if (error.message.includes("API key")) {
      console.log("\n💡 API Key 相关问题:");
      console.log("1. 确保 .env.local 中有 BSCSCAN_API_KEY");
      console.log("2. 检查 API Key 是否有效");
      console.log("3. 确认 hardhat.config.ts 中的配置正确");
    }
  }
}

