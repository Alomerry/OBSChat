# obs twitch chat

## 原理

本质是使用 nginx 转发访问 irc-ws.chat.twitch.tv 的 websocket 请求。用户会访问我搭建在香港（未被墙）的服务 irs.chat.alomerry.com，后转发至 twitch。