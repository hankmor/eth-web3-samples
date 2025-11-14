// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * Event 最佳实践示例
 */
contract EventExample {
    // 1. 使用 indexed 参数便于搜索（最多 3 个）
    event UserRegistered(
        address indexed user,
        string username,
        uint256 indexed timestamp
    );
    
    // 2. 记录状态变化
    event BalanceChanged(
        address indexed user,
        uint256 oldBalance,
        uint256 newBalance
    );
    
    // 3. 记录重要操作
    event AdminAction(
        address indexed admin,
        string action,
        bytes data
    );
    
    mapping(address => uint256) public balances;
    
    function deposit() public payable {
        uint256 oldBalance = balances[msg.sender];
        balances[msg.sender] += msg.value;
        
        // 发出事件记录变化
        emit BalanceChanged(msg.sender, oldBalance, balances[msg.sender]);
    }
    
    function register(string memory username) public {
        // 注册逻辑
        emit UserRegistered(msg.sender, username, block.timestamp);
    }
    
    // 4. 用 event 替代昂贵的存储
    // ❌ 不要这样做（浪费 Gas）
    // string[] public allUsernames;  // 存储所有用户名，非常贵！
    
    // ✅ 应该这样做
    // emit UserRegistered(...);  // 通过事件记录，链下索引
}

/**
 * ERC20 标准中的 Event 使用
 */
contract SimpleToken {
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // ERC20 标准事件
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        // 记录转账事件
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        
        // 记录授权事件
        emit Approval(msg.sender, spender, amount);
        return true;
    }
}

