# pi-openrouter-balance

A [pi](https://pi.dev) extension that shows your **OpenRouter account balance** in the status bar, for example `💵 OR $4.60`.

## When it shows

Visibility is decided by provider, the same way `pi-ark-quota` does it — only by where the current model actually runs:

| Current model | Shown |
|---|---|
| Provider whose base URL host is `openrouter.ai` | Shown |
| Any other provider (official DeepSeek, Volcano Ark, …) | Hidden, no status bar space used |
| The virtual model `deepseek/auto` | Follows the provider of the **last reply** on the session branch: if the previous turn went to OpenRouter it shows, if it went to the official DeepSeek endpoint it hides |

`deepseek/auto` is a virtual model. The provider you select it under is `deepseek`, which does not identify the real endpoint, so this extension does not look at `ctx.model.provider`. It reads the `provider` of the last assistant message from `ctx.sessionManager.getBranch()` instead. Before the first reply of a turn, it falls back to the provider the virtual model is registered under.

The check is the host name of the provider's base URL, not the provider's name, so a renamed or custom provider works too.

## Data source

`GET https://openrouter.ai/api/v1/credits`, authenticated with the provider key pi already holds (`ctx.modelRegistry.getApiKeyForProvider()`). No extra environment variable is needed.

```json
{"data":{"total_credits":100,"total_usage":95.39983776}}
```

Remaining credit = `total_credits - total_usage`.

## Status bar colors

| Condition | Color |
|---|---|
| Remaining ≤ 0 | Red |
| Remaining < threshold (5 USD by default) | Yellow |
| Otherwise | Normal |

When the query fails, the status reads a dim `💵 OR login ✗` / `💵 OR no key` / `💵 OR ✗`. A 401 or 403 clears the cache so a stale number is never shown.

## Install

```bash
pi install npm:@ymy88/pi-openrouter-balance
```

You can also install from git or from a local directory:

```bash
pi install git:github.com/ymy88/pi-openrouter-balance
pi install ~/Projects/pi-openrouter-balance
```

Then run `/reload` inside pi.

The unscoped name `pi-openrouter-balance` on npm belongs to another author, which is why this package is published under the `@ymy88` scope.

## Command

| Command | Effect |
|---|---|
| `/openrouter-balance` | Refresh immediately and report total, used, and remaining credit |

## Configuration (optional environment variables)

| Variable | Default |
|---|---|
| `OPENROUTER_BALANCE_TTL_MS` | `300000` (5 minute cache) |
| `OPENROUTER_BALANCE_LOW_USD` | `5` (below this the number turns yellow) |

Refreshes happen on `session_start`, `model_select`, and `agent_settled` (end of every turn), all bounded by the cache TTL.

## Tests

```bash
npm test
```

Only the pure functions are tested — parsing, colors, status text, host matching, and the visibility decision for virtual models. No network requests are made.

## License

MIT, see [LICENSE](LICENSE).
