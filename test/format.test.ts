/** 纯函数自检，直接 node --experimental-strip-types 跑。 */

import assert from "node:assert/strict";
import {
	activeProvider,
	colorRole,
	formatDetails,
	hostOf,
	isTargetHost,
	parseCredits,
	renderBalance,
} from "../index.ts";

const identity = (_role: string, text: string) => text;

// /credits 的真实响应形状
const real = { data: { total_credits: 100, total_usage: 95.39983776 } };
const balance = parseCredits(real);
assert.ok(balance);
assert.equal(balance.total, 100);
assert.equal(balance.used, 95.39983776);
assert.equal(balance.remaining.toFixed(2), "4.60");

// 缺 total_usage 时按 0 算；缺 total_credits 时返回 null
assert.equal(parseCredits({ data: { total_credits: 20 } })?.remaining, 20);
assert.equal(parseCredits({ data: {} }), null);
assert.equal(parseCredits({}), null);

// 颜色
assert.equal(colorRole(0), "error");
assert.equal(colorRole(-1), "error");
assert.equal(colorRole(4.6), "warning");
assert.equal(colorRole(5), "success");
assert.equal(colorRole(4.6, 2), "success");

// 状态栏文本
assert.equal(renderBalance(identity, balance), "💵 OR $4.60");
assert.match(formatDetails(balance), /95\.40/);

// 主机名匹配
assert.equal(hostOf("https://openrouter.ai/api/v1"), "openrouter.ai");
assert.equal(hostOf("https://api.deepseek.com/v1"), "api.deepseek.com");
assert.equal(hostOf("not a url"), undefined);
assert.equal(hostOf(undefined), undefined);
assert.equal(isTargetHost("https://openrouter.ai/api/v1"), true);
assert.equal(isTargetHost("https://api.deepseek.com/v1"), false);
assert.equal(isTargetHost(undefined), false);

// 可见性：物理模型用自身 provider
assert.equal(activeProvider({ model: { provider: "openrouter", api: "openai-completions" } }), "openrouter");
assert.equal(activeProvider({}), undefined);

// 虚拟模型用分支里最后一条助手的 provider
const ctx = (messages: any[]) => ({
	model: { provider: "deepseek", id: "auto", api: "pi-virtual" },
	sessionManager: { getBranch: () => messages.map((message) => ({ type: "message", message })) },
});
assert.equal(activeProvider(ctx([{ role: "user" }, { role: "assistant", provider: "openrouter" }])), "openrouter");
assert.equal(activeProvider(ctx([{ role: "assistant", provider: "deepseek" }])), "deepseek");
// 还没回复过：按虚拟模型登记的 provider
assert.equal(activeProvider(ctx([{ role: "user" }])), "deepseek");

console.log("pi-openrouter-balance: 全部通过");
