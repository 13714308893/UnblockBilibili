# 哔哩哔哩番剧解锁

## 使用方法

- 浏览器安装 [油猴 beta](https://www.tampermonkey.net)
- 打开 [该链接](https://github.com/vcheckzen/UnblockBilibili/raw/master/unblock.bilibili.user.js)，选择 `安装`
- 进入油猴 `管理面板`，`编辑已安装脚本` 中的 `哔哩哔哩番剧解锁`
- 填入大会员 `VIP_COOKIES` 后，按 `Ctrl + S` 保存
- 打开番剧测试

## VIP_COOKIES

- 打开 [Chrome 浏览器](https://www.google.cn/chrome)
- 使用 `大会员账号` 登录 [哔哩哔哩](https://passport.bilibili.com/login)
- `F12` 打开浏览器 `控制台`，切换到 `Network` 面板
- 打开 [任一会员番剧](https://www.bilibili.com/bangumi/play/ep267685/)
- 在控制台 `Filter` 中输入 `play/ep` 后回车搜索
- 点击 `番剧页` 对应请求，查看 `Request Headers`
- 其中 `Cookie` 值，即为所需的 `VIP_COOKIES`
