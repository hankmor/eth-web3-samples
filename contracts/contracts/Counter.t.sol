// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Counter} from "./Counter.sol";
import {Test} from "forge-std/Test.sol";

contract CounterTest is Test {
    // Counter 合约的实例, 测试合约调用Counter合约
    Counter counter;

    // 设置测试环境
    function setUp() public {
        counter = new Counter();
    }

    // 测试初始值
    function test_InitialValue() public view {
        require(counter.x() == 0, "Initial value should be 0");
    }

    // 测试 inc 函数, 这是一个模糊测试，x 是有hardhat随机生成的一个数， 并会多次调用inc函数
    function testFuzz_Inc(uint8 x) public {
        for (uint8 i = 0; i < x; i++) {
            counter.inc();
        }
        require(
            counter.x() == x,
            "Value after calling inc x times should be x"
        );
    }

    // 测试 incBy 函数, 传入 0，应该抛出错误
    function test_IncByZero() public {
        // 使用 vm.expectRevert() 来验证函数调用是否抛出错误
        // vm.expectRevert();
        // 测试 incBy 函数，传入 0，应该抛出错误
        counter.incBy(0);
    }
}
