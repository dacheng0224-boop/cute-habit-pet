# Android 壳工程（TWA）

本目录用于存放 TWA 生成的 Android 工程。

## 快速开始

1) 先把 Web 应用部署到 HTTPS 域名（确保可访问 `manifest.webmanifest`）。

2) 执行初始化脚本：

```bash
cd "/Users/zzz/cute-habit-pet"
./scripts/setup_twa.sh
```

3) 脚本首次执行会生成：

- `android/twa/twa-manifest.json`
- 你也可以参考：`android/twa-manifest.example.json`

请修改这个文件中的：

- `host`
- `webManifestUrl`
- `iconUrl`
- `maskableIconUrl`
- `packageId`（默认已是 `com.zzz.cutehabitpet`，如无特别需求可不改）

4) 再次执行脚本后，会自动尝试：

- `bubblewrap init`
- `bubblewrap build`

## APK 位置

通常在以下路径：

- `android/twa/app/build/outputs/apk/debug/*.apk`
- `android/twa/app/build/outputs/apk/release/*.apk`

## 常见问题

- 没有 `npm`：先安装 Node.js LTS。
- 缺少 Android SDK：安装 Android Studio 并完成 SDK 配置。
- 签名失败：按 bubblewrap 提示配置 keystore。
