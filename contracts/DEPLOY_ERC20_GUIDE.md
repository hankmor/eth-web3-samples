# 🚀 ERC20 代币部署指南

## 📋 准备工作

### 1. 确保环境配置正确

检查你的 `.env.local` 文件是否包含：

```bash
# BSC 测试网配置
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
BSC_TESTNET_PRIVATE_KEY=你的私钥
ETHERSCAN_API_KEY=你的API密钥（用于验证合约）
```

### 2. 获取测试 BNB

访问 BSC 测试网水龙头获取测试 BNB：
- 🔗 https://testnet.bnbchain.org/faucet-smart
- 输入你的钱包地址
- 获取 0.1 BNB 测试币

## 🚀 部署步骤

### 方法 1：部署简单 ERC20 合约（推荐）

```bash
npx hardhat run scripts/deploy-simple-erc20.ts --network bscTestnet
```

**特点：**
- ✅ 标准 ERC20 功能
- ✅ 自动铸造 1,000,000 代币给部署者
- ✅ 简单易用
- ✅ 包含所有标准函数

### 方法 2：部署可铸造/销毁的 ERC20 合约

```bash
npx hardhat run scripts/deploy-erc20-bsc.ts --network bscTestnet
```

**特点：**
- ✅ 包含方法 1 的所有功能
- ✅ 额外的铸造功能（只有 owner 可以）
- ✅ 销毁功能（任何人都可以销毁自己的代币）
- ✅ 更复杂，适合高级用户

## 🧪 测试部署的代币

### 1. 更新测试脚本

部署完成后，复制合约地址到 `scripts/test-erc20.ts`：

```typescript
const TOKEN_ADDRESS = "0x你的合约地址" as `0x${string}`;
```

### 2. 运行测试

```bash
npx hardhat run scripts/test-erc20.ts --network bscTestnet
```

**测试内容：**
- ✅ 代币信息查询
- ✅ 余额查询
- ✅ 转账功能
- ✅ 授权功能
- ✅ 代理转账功能

## 🔍 验证合约

### 自动验证

```bash
npx hardhat verify --network bscTestnet 0x你的合约地址
```

### 手动验证

1. 访问 https://testnet.bscscan.com/address/0x你的合约地址
2. 点击 "Contract" 标签
3. 点击 "Verify and Publish"
4. 选择 "Solidity (Single file)"
5. 输入合约代码
6. 选择编译器版本 0.8.28
7. 点击 "Verify and Publish"

## 📱 添加到 MetaMask

### 1. 添加 BSC 测试网

**网络信息：**
- 网络名称：BSC Testnet
- RPC URL：https://data-seed-prebsc-1-s1.bnbchain.org:8545
- 链 ID：97
- 符号：tBNB
- 区块浏览器：https://testnet.bscscan.com

### 2. 添加代币

1. 在 MetaMask 中点击 "导入代币"
2. 选择 "自定义代币"
3. 输入：
   - 代币合约地址：`0x你的合约地址`
   - 代币符号：`MTT`
   - 小数精度：`18`

## 🎯 代币功能说明

### 标准 ERC20 功能

| 函数 | 功能 | 说明 |
|------|------|------|
| `name()` | 查询代币名称 | 返回 "MyTestToken" |
| `symbol()` | 查询代币符号 | 返回 "MTT" |
| `decimals()` | 查询小数位数 | 返回 18 |
| `totalSupply()` | 查询总供应量 | 返回 1,000,000 * 10^18 |
| `balanceOf(address)` | 查询余额 | 返回指定地址的余额 |
| `transfer(to, amount)` | 转账 | 从调用者转账到指定地址 |
| `approve(spender, amount)` | 授权 | 授权指定地址花费代币 |
| `allowance(owner, spender)` | 查询授权额度 | 返回授权额度 |
| `transferFrom(from, to, amount)` | 代理转账 | 代表他人转账 |

### 扩展功能（仅 MintableBurnableToken）

| 函数 | 功能 | 权限 |
|------|------|------|
| `mint(to, amount)` | 铸造新代币 | 仅 owner |
| `burn(amount)` | 销毁自己的代币 | 任何人 |
| `burnFrom(account, amount)` | 销毁他人的代币 | 需要授权 |

## 🔗 有用的链接

- **BSC 测试网水龙头**：https://testnet.bnbchain.org/faucet-smart
- **BSCScan 测试网**：https://testnet.bscscan.com
- **BSC 测试网文档**：https://docs.bnbchain.org/docs/rpc
- **ERC20 标准**：https://eips.ethereum.org/EIPS/eip-20

## 🚨 注意事项

1. **私钥安全**：永远不要在代码中硬编码私钥
2. **测试网**：这是测试网，代币没有实际价值
3. **Gas 费用**：需要 BNB 支付交易费用
4. **合约验证**：验证合约可以让其他人查看源代码
5. **代币符号**：确保代币符号不与其他代币冲突

## 🎉 部署成功后的操作

1. ✅ 在 BSCScan 上查看合约
2. ✅ 验证合约源代码
3. ✅ 在 MetaMask 中添加代币
4. ✅ 测试转账功能
5. ✅ 测试授权功能
6. ✅ 分享合约地址给朋友测试

## 📞 遇到问题？

1. **余额不足**：使用 BSC 测试网水龙头获取 BNB
2. **部署失败**：检查网络连接和私钥配置
3. **验证失败**：确保编译器版本和优化设置正确
4. **代币不显示**：检查 MetaMask 网络设置和代币地址

---

🎯 **现在就开始部署你的第一个 ERC20 代币吧！**
