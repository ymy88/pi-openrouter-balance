# pi-openrouter-balance

一个 [pi](https://pi.dev) 扩展，把 **OpenRouter 账户余额**显示在状态栏，例如 `💵 OR $4.60`。

## 显示规则

和 `pi-ark-quota` 一样按 provider 判断，只看当前模型实际落在哪个端点上：

| 当前模型 | 是否显示 |
|---|---|
| provider 的 baseUrl 主机名等于 `openrouter.ai` | 显示 |
| 其他 provider（DeepSeek 官方、火山、…） | 隐藏，不占状态栏 |
| 虚拟模型 `deepseek/auto` | 看会话分支里**最后一条回复**的 provider：上一轮走 OpenRouter 就显示，走 DeepSeek 官方就隐藏 |

小模型 `deepseek/auto` 是虚拟模型，选择它的 provider 是 `deepseek`，本身不代表真实端点，所以这里不用 `ctx.model.provider` 判断，而是读 `ctx.sessionManager.getBranch()` 里最后一条 assistant 消息的 `provider`。这一轮还没回复过时，退回虚拟模型登记的 provider。

判断依据是 baseUrl 的主机名，不是 provider 名字，所以你自定义同名或改名的 provider 也能用。

## 数据来源

`GET https://openrouter.ai/api/v1/credits`，密钥用 pi 里已有的 provider 密钥（`ctx.modelRegistry.getApiKeyForProvider()`），不需要额外配置环境变量。

```json
{"data":{"total_credits":100,"total_usage":95.39983776}}
```

剩余额度 = `total_credits - total_usage`。

## 状态栏颜色

| 条件 | 颜色 |
|---|---|
| 剩余 ≤ 0 | 红 |
| 剩余 < 阈值（默认 5 美元） | 黄 |
| 其他 | 正常 |

查询失败时显示暗色的 `💵 OR 登录✗` / `💵 OR 无密钥` / `💵 OR ✗`，不显示过期数字（401/403 会清空缓存）。

## 安装

```bash
pi install npm:pi-openrouter-balance
```

也可以直接装 git 版本，或者装本地目录：

```bash
pi install git:github.com/ymy88/pi-openrouter-balance
pi install ~/Projects/pi-openrouter-balance
```

然后在 pi 里 `/reload`。

## 命令

| 命令 | 作用 |
|---|---|
| `/openrouter-balance` | 强制刷新并显示总额、已用、剩余 |

## 配置（环境变量，可选）

| 变量 | 默认 |
|---|---|
| `OPENROUTER_BALANCE_TTL_MS` | `300000`（5 分钟缓存） |
| `OPENROUTER_BALANCE_LOW_USD` | `5`（低于它标黄） |

刷新时机：`session_start`、`model_select`、`agent_settled`（每轮结束），都受缓存 TTL 约束。

## 测试

```bash
npm test
```

只测纯函数（解析、颜色、文本、主机名匹配、虚拟模型可见性判断），不发网络请求。

## 许可证

MIT，见 [LICENSE](LICENSE)。
