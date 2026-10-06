# Autogrinding Bot

A Mineflayer bot configured for SchoolProject

## Installation and startup

Install dependencies from the project directory:

```sh
npm install
```

Configure `settings.json`, then start the bot:

```sh
node bot.js
```

The `schoolproject` plugin is installed from
[youtubeisgaydotcom/schoolproject](https://github.com/youtubeisgaydotcom/schoolproject).

## Configuration

Edit `settings.json`:

- `bot-account.username`: Minecraft account name.
- `bot-account.type`: authentication type; this project currently uses `microsoft`.
- `server.ip`, `server.port`, `server.version`: connection details.
- `server.cracked-login-password`: optional in-game password. After connecting, the
  bot waits 10 seconds, sends `/login <password>` if configured, then waits another
  10 seconds and sends `/server opfactions`. Leave it blank to skip `/login`.
- `position.enabled` and `position.x/y/z`: whether to pathfind to the target
  coordinates after spawning.
- `utils.auto-fix-hand`: enables periodic `/fix hand` commands.
- `utils.auto-fix-hand-delay`: `/fix hand` interval in seconds (default: `51`).
- `utils.auto-feed`: enables periodic `/feed` commands.
- `utils.auto-feed-delay`: `/feed` interval in seconds (default: `30`).
- `utils.chat-messages.enabled`: enables configured chat messages.
- `utils.chat-messages.repeat`: repeats messages at the configured interval when
  enabled; `repeat-delay` is in seconds. When disabled, configured messages are sent
  once after spawning.
- `utils.chat-log`: logs incoming chat.
- `utils.auto-reconnect` and `utils.auto-reconnect-delay`: enable reconnection and
  set its delay in milliseconds.

## In-game commands

The bot responds to chat commands prefixed with `!`:

- `!help` — list commands.
- `!status` — report online status and ping.
- `!coords` — report current coordinates.
