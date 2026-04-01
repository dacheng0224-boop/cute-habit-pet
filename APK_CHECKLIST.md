# 从 0 到 debug APK 清单（你的当前配置）

当前默认配置：

- 包名：`com.zzz.cutehabitpet`
- 域名：暂用占位 `example.com`（上线后替换）

## A. 安装依赖（一次性）

1. 安装 Node.js LTS（会自带 `npm`）
2. 安装 Android Studio，并在 SDK Manager 安装：
   - Android SDK Platform（建议 API 34）
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
3. 确认 Java（你已具备）

## B. 部署 Web App（必须 HTTPS）

将 `/Users/zzz/cute-habit-pet` 部署到线上，确保可访问：

- `https://你的域名/`
- `https://你的域名/manifest.webmanifest`
- `https://你的域名/icons/icon-512.png`（建议补充 PNG）

## C. 生成 TWA 工程

```bash
cd "/Users/zzz/cute-habit-pet"
./scripts/setup_twa.sh
```

首次执行会生成：

- `android/twa/twa-manifest.json`

把其中 `example.com` 和相关 URL 改成你的真实域名后，再执行一次：

```bash
./scripts/setup_twa.sh
```

## D. 构建 debug APK

若脚本执行到 `bubblewrap build` 成功，APK 通常位于：

- `android/twa/app/build/outputs/apk/debug/`

## E. 手机安装

```bash
adb install -r android/twa/app/build/outputs/apk/debug/*.apk
```

或直接把 APK 传到手机手动安装。
