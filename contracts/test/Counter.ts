import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

// 集成测试
describe("Counter", async function () {
  // 链接chain网络
  const { viem } = await network.connect();
  // 获取公共客户端
  const publicClient = await viem.getPublicClient();

  it("Should emit the Increment event when calling the inc() function", async function () {
    // 部署合约
    const counter = await viem.deployContract("Counter");

    // 执行合约的函数，并断言触发 Increment 事件
    await viem.assertions.emitWithArgs(
      counter.write.inc(),
      counter,
      "Increment",
      [1n],
    );
  });

  it("The sum of the Increment events should match the current value", async function () {
    const counter = await viem.deployContract("Counter");
    // 获取最新区块高度
    const deploymentBlockNumber = await publicClient.getBlockNumber();

    // run a series of increments
    for (let i = 1n; i <= 10n; i++) {
      await counter.write.incBy([i]);
    }

    const events = await publicClient.getContractEvents({
      address: counter.address,
      abi: counter.abi,
      eventName: "Increment",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });

    // check that the aggregated events match the current value
    let total = 0n;
    for (const event of events) {
      total += event.args.by;
    }

    assert.equal(total, await counter.read.x());
  });
});
