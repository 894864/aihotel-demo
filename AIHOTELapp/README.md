# AIHOTELapp 安卓 Demo

这是酒店客需工单看板的原生 Android Demo，路径：

```text
D:\Program Files\AIHOTEL\AIHOTELapp
```

## 功能

- 前台看板：按未完成、未接单、已接单、已完成、已超时筛选工单
- 员工端：选择员工身份，接单、完成
- 主管看板：查看总单、未完成、超时、完成排行
- AI 来电：输入中文电话文本，本地规则识别房号、部门、优先级、SLA，并生成工单

## 构建 APK

当前机器没有 Android SDK 和 Gradle，因此无法在本环境直接打包 APK。

安装 Android Studio 后：

1. 用 Android Studio 打开本目录。
2. 等待 Gradle Sync。
3. 点击 `Build > Build Bundle(s) / APK(s) > Build APK(s)`。

或命令行：

```powershell
cd "D:\Program Files\AIHOTEL\AIHOTELapp"
.\gradlew assembleDebug
```

APK 输出位置通常是：

```text
app\build\outputs\apk\debug\app-debug.apk
```
