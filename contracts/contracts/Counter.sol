// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Counter {
  // public 表示该变量可以被其他合约访问
  uint public x;

  // event 表示事件，可以被其他合约监听
  event Increment(uint by);

  // function 表示函数，public 表示该函数可以被其他合约调用
  function inc() public {
    x++;
    // emit 表示触发事件
    emit Increment(1);
  }

  // function 表示函数，public 表示该函数可以被其他合约调用
  function incBy(uint by) public {
    // require 表示条件，如果条件不成立，则抛出错误
    require(by > 0, "incBy: increment should be positive");
    x += by;
    // emit 表示触发事件
    emit Increment(by);
  }
}
