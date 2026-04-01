# 可爱习惯打卡（安卓 APK 目标）

这是一个独立的新项目，位于 `/Users/zzz/cute-habit-pet`，功能包括：

- 多习惯打卡（emoji + 描述）
- 月历视图（每日打卡数量 + emoji 标记）
- 宠物成长（近 30 天成长值，4 档位）
- 宠物档位动效场景（四档位不同背景 + 进度条）
- 本地离线可用（localStorage + service worker）

## 1) 本地运行

在项目目录执行：

```bash
cd "/Users/zzz/cute-habit-pet"
python3 -m http.server 8790
```

浏览器打开：`http://127.0.0.1:8790`

## 2) 宠物档位规则

- Lv1 幼崽：0-19
- Lv2 成长期：20-49
- Lv3 活力期：50-89
- Lv4 成熟期：90+

规则：每打卡 1 个习惯 1 次 = 1 点成长值；统计近 30 天累计值。

## 3) 安卓 APK 打包（建议 TWA）

推荐流程：

1. 先将此 Web App 部署到一个 https 地址（如 Vercel、Netlify）。
2. 用 `bubblewrap` 初始化 TWA 工程并绑定你的域名。
3. 使用 Android Studio 构建 `debug/release APK`。

示例命令：

```bash
cd "/Users/zzz/cute-habit-pet"
./scripts/setup_twa.sh
```

脚本会自动检查环境、提示你填写 `android/twa/twa-manifest.json`，然后执行 `bubblewrap init/build`。

## 4) 图标说明

`manifest.webmanifest` 已配置：

- `icons/icon-192.svg`
- `icons/icon-512.svg`

当前已提供可运行的 SVG 图标。若用于正式上架，建议再补充高质量 PNG 图标（192/512）。

## 5) Android 目录

详见：`android/README.md`

另外可按你的当前环境直接执行：`APK_CHECKLIST.md`
