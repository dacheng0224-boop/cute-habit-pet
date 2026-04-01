#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$APP_ROOT/android"

echo "[1/5] 检查基础工具..."
if ! command -v java >/dev/null 2>&1; then
  echo "未检测到 java，请先安装 JDK 17+。"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "未检测到 npm。macOS 可先安装 Node.js（建议 LTS），再重试。"
  exit 1
fi

echo "[2/5] 安装 bubblewrap CLI..."
npm i -g @bubblewrap/cli

echo "[3/5] 准备 TWA 配置目录..."
mkdir -p "$ANDROID_DIR/twa"
cd "$ANDROID_DIR/twa"

if [ ! -f "twa-manifest.json" ]; then
  cat > twa-manifest.json <<'EOF'
{
  "packageId": "com.zzz.cutehabitpet",
  "host": "example.com",
  "name": "可爱习惯打卡",
  "launcherName": "习惯打卡",
  "display": "standalone",
  "themeColor": "#ff9ecf",
  "navigationColor": "#ff9ecf",
  "backgroundColor": "#fff4fb",
  "enableNotifications": false,
  "startUrl": "/",
  "iconUrl": "https://example.com/icons/icon-512.png",
  "maskableIconUrl": "https://example.com/icons/icon-512.png",
  "appVersionName": "1.0.0",
  "appVersionCode": 1,
  "shortcuts": [],
  "generatorApp": "bubblewrap",
  "webManifestUrl": "https://example.com/manifest.webmanifest",
  "fallbackType": "customtabs"
}
EOF
  echo "已生成示例配置: $ANDROID_DIR/twa/twa-manifest.json"
  echo "请先把 host、webManifestUrl、iconUrl、maskableIconUrl 改成你的线上地址，然后再执行构建脚本。"
  exit 0
fi

echo "[4/5] 基于配置初始化 Android 工程..."
bubblewrap init --manifest "$ANDROID_DIR/twa/twa-manifest.json"

echo "[5/5] 尝试构建 debug APK..."
bubblewrap build

echo "完成。APK 产物通常在: $ANDROID_DIR/twa/app/build/outputs/apk/"
