// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./HandwrittenERC20.sol";

/**
 * ERC20 代币，转账时收取原生代币（BNB/ETH）作为手续费
 * 
 * 功能：
 * - 转账时要求支付固定金额的原生代币
 * - 支持设置收费地址
 * - 支持设置白名单（免手续费地址）
 * - 支持动态调整手续费
 */
contract ERC20WithNativeFee is HandwrittenERC20, Ownable {
    // 收费地址（接收原生代币的地址）
    address public feeRecipient;
    
    // 固定手续费金额（以 wei 为单位）
    uint256 public nativeFeeAmount;
    
    // 白名单：免手续费地址
    mapping(address => bool) public feeExempt;
    
    // 事件：记录手续费收取
    event NativeFeeCollected(address indexed from, address indexed to, uint256 feeAmount);
    event FeeConfigUpdated(address indexed newRecipient, uint256 newFeeAmount);
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint8 _decimals,
        address _feeRecipient,
        uint256 _nativeFeeAmount
    ) HandwrittenERC20(_name, _symbol, _totalSupply, _decimals) {
        require(_feeRecipient != address(0), "Fee recipient cannot be zero address");
        feeRecipient = _feeRecipient;
        nativeFeeAmount = _nativeFeeAmount;
        
        // 部署者和收费地址默认免手续费
        feeExempt[msg.sender] = true;
        feeExempt[_feeRecipient] = true;
    }
    
    /**
     * @dev 设置收费配置
     */
    function setFeeConfig(address _feeRecipient, uint256 _nativeFeeAmount) external onlyOwner {
        require(_feeRecipient != address(0), "Fee recipient cannot be zero address");
        feeRecipient = _feeRecipient;
        nativeFeeAmount = _nativeFeeAmount;
        emit FeeConfigUpdated(_feeRecipient, _nativeFeeAmount);
    }
    
    /**
     * @dev 设置地址的手续费豁免状态
     */
    function setFeeExempt(address account, bool exempt) external onlyOwner {
        feeExempt[account] = exempt;
    }
    
    /**
     * @dev 重写 transfer，添加原生代币手续费检查
     */
    function transfer(address to, uint256 amount) public payable override returns (bool) {
        // 检查是否需要支付手续费
        if (!feeExempt[msg.sender] && !feeExempt[to] && nativeFeeAmount > 0) {
            require(msg.value >= nativeFeeAmount, "Insufficient native token for fee");
            
            // 将手续费发送到收费地址
            (bool success, ) = feeRecipient.call{value: nativeFeeAmount}("");
            require(success, "Fee transfer failed");
            
            // 如果有剩余的原生代币，退回给调用者
            if (msg.value > nativeFeeAmount) {
                (bool refundSuccess, ) = msg.sender.call{value: msg.value - nativeFeeAmount}("");
                require(refundSuccess, "Refund failed");
            }
            
            emit NativeFeeCollected(msg.sender, to, nativeFeeAmount);
        } else {
            // 如果不需要手续费，但用户发送了原生代币，退回
            if (msg.value > 0) {
                (bool refundSuccess, ) = msg.sender.call{value: msg.value}("");
                require(refundSuccess, "Refund failed");
            }
        }
        
        // 执行正常的 ERC20 转账
        return super.transfer(to, amount);
    }
    
    /**
     * @dev 重写 transferFrom，添加原生代币手续费检查
     * 
     * 注意：对于 transferFrom，手续费从调用者（msg.sender）收取，而不是从代币发送者（from）收取
     * 因为调用者通常是智能合约或第三方，他们负责支付交易费用
     */
    function transferFrom(address from, address to, uint256 amount) public payable override returns (bool) {
        // 检查是否需要支付手续费
        // 注意：这里检查的是调用者（msg.sender）是否在白名单中
        // 如果 from 或 to 在白名单中，也可能免除手续费（可根据需求调整逻辑）
        bool isExempt = feeExempt[msg.sender] || feeExempt[from] || feeExempt[to];
        
        if (!isExempt && nativeFeeAmount > 0) {
            require(msg.value >= nativeFeeAmount, "Insufficient native token for fee");
            
            // 将手续费发送到收费地址
            (bool success, ) = feeRecipient.call{value: nativeFeeAmount}("");
            require(success, "Fee transfer failed");
            
            // 如果有剩余的原生代币，退回给调用者
            if (msg.value > nativeFeeAmount) {
                (bool refundSuccess, ) = msg.sender.call{value: msg.value - nativeFeeAmount}("");
                require(refundSuccess, "Refund failed");
            }
            
            emit NativeFeeCollected(from, to, nativeFeeAmount);
        } else {
            // 如果不需要手续费，但用户发送了原生代币，退回
            if (msg.value > 0) {
                (bool refundSuccess, ) = msg.sender.call{value: msg.value}("");
                require(refundSuccess, "Refund failed");
            }
        }
        
        // 执行正常的 ERC20 transferFrom
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev 查询特定转账所需的手续费
     */
    function getRequiredFee(address from, address to) public view returns (uint256) {
        if (feeExempt[from] || feeExempt[to]) {
            return 0;
        }
        return nativeFeeAmount;
    }
    
    /**
     * @dev Owner 可以提取合约中的原生代币（以防意外发送）
     */
    function withdrawNativeToken(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot withdraw to zero address");
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = to.call{value: amount}("");
        require(success, "Withdraw failed");
    }
    
    /**
     * @dev 接收原生代币的回退函数（可选，用于接收捐赠等）
     */
    receive() external payable {
        // 允许接收原生代币，但不会自动转发
        // 可以通过 withdrawNativeToken 提取
    }
}

