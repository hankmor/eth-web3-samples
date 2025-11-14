// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * 第三阶段：手写 ERC20 代币
 * 
 * 完全从零实现 ERC20 标准，不使用任何库
 * 
 * ERC20 标准接口：
 * https://eips.ethereum.org/EIPS/eip-20
 * 
 * 学习重点：
 * - ERC20 标准的每个函数
 * - 授权（allowance）机制
 * - 转账安全性
 * - 溢出保护（Solidity 0.8+ 自带）
 */

contract HandwrittenERC20 {
    // ============================================
    // 状态变量
    // ============================================
    
    string public name;           // 代币名称
    string public symbol;         // 代币符号
    uint8 public decimals;        // 小数位数（通常是 18）
    uint256 private _totalSupply; // 总供应量
    
    // 每个地址的余额
    mapping(address => uint256) private _balances;
    
    // 授权额度：owner => spender => amount
    mapping(address => mapping(address => uint256)) private _allowances;
    
    // ============================================
    // 事件（ERC20 标准要求）
    // ============================================
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    // ============================================
    // 构造函数
    // ============================================
    
    constructor(string memory _name, string memory _symbol, uint256 _initSupply, uint8 _decimals) {
        require(_decimals > 0, "Decimals must be greater than 0");
        require(_initSupply > 0, "Total supply must be greater than 0");
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _totalSupply = _initSupply;

        // 铸造初始供应量给部署者
        _mint(msg.sender, _initSupply * 10**_decimals);
    }
    
    // ============================================
    // ERC20 标准函数
    // ============================================
    
    /**
     * @dev 返回总供应量
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    
    /**
     * @dev 返回指定地址的余额
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    /**
     * @dev 转账代币
     * 
     * 要求：
     * - 发送者余额充足
     * - 接收地址不是零地址
     * 
     * 触发 Transfer 事件
     */
    function transfer(address to, uint256 amount) public virtual payable returns (bool) {
        address owner = msg.sender;
        _transfer(owner, to, amount);
        return true;
    }
    
    /**
     * @dev 返回 spender 可以代表 owner 花费的额度
     */
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }
    
    /**
     * @dev 授权 spender 可以花费 amount 数量的代币
     * 
     * 触发 Approval 事件
     */
    function approve(address spender, uint256 amount) public returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }
    
    /**
     * @dev 从 from 转账 amount 到 to
     * 
     * 要求：
     * - 调用者必须有足够的授权额度
     * 
     * 触发 Transfer 事件
     * 更新授权额度
     */
    function transferFrom(address from, address to, uint256 amount) public virtual payable returns (bool) {
        address spender = msg.sender;
        
        // 检查并减少授权额度
        _spendAllowance(from, spender, amount);
        
        // 执行转账
        _transfer(from, to, amount);
        
        return true;
    }
    
    // ============================================
    // 内部函数（实现核心逻辑）
    // ============================================
    
    /**
     * @dev 内部转账函数
     */
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "Insufficient balance");
        
        // 更新余额
        // Solidity 0.8+ 自动检查溢出，不需要 SafeMath
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
    }
    
    /**
     * @dev 铸造代币（创建新代币）
     */
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "Mint to zero address");
        require(amount > 0, "Mint amount must be greater than 0");
        
        _totalSupply += amount;
        _balances[account] += amount;
        
        emit Transfer(address(0), account, amount);
    }
    
    /**
     * @dev 销毁代币
     */
    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "Burn from zero address");
        
        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "Burn amount exceeds balance");
        
        _balances[account] = accountBalance - amount;
        _totalSupply -= amount;
        
        emit Transfer(account, address(0), amount);
    }
    
    /**
     * @dev 设置授权额度
     */
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "Approve from zero address");
        require(spender != address(0), "Approve to zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    
    /**
     * @dev 消耗授权额度
     */
    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner, spender);
        
        // 如果授权额度不是无限大（type(uint256).max）
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "Insufficient allowance");
            _approve(owner, spender, currentAllowance - amount);
        }
    }
}

// ============================================
// 扩展功能：可铸造和可销毁
// ============================================

// 简单的 Ownable 实现
contract Ownable {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
}

contract MintableBurnableToken is HandwrittenERC20, Ownable {
    constructor(string memory _name, string memory _symbol, uint256 _totalSupply, uint8 _decimals) HandwrittenERC20(_name, _symbol, _totalSupply, _decimals) {}
    
    /**
     * @dev 只有 owner 可以铸造新代币
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev 任何人都可以销毁自己的代币
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev 销毁其他人的代币（需要授权）
     */
    function burnFrom(address account, uint256 amount) public {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}

// ============================================
// 使用示例
// ============================================

contract TokenExample {
    HandwrittenERC20 public token;
    
    constructor() {
        token = new HandwrittenERC20("Example Token", "EXT", 1000000, 18);
    }
    
    function exampleUsage() public {
        // 查询余额
        uint balance = token.balanceOf(msg.sender);
        
        // 转账
        token.transfer(address(0x123), 100);
        
        // 授权
        token.approve(address(this), 1000);
        
        // 代理转账
        token.transferFrom(msg.sender, address(0x456), 50);
    }
}