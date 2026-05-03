# AIHOTEL PWA 使用说明

当前建议使用根目录的 Next.js PWA 项目：

```text
D:\Program Files\AIHOTEL
```

## 本地启动

```powershell
cd "D:\Program Files\AIHOTEL"
npm run dev
```

电脑浏览器访问：

```text
http://localhost:3000
```

## 手机访问

1. 确保电脑和手机在同一个 Wi-Fi。
2. 在电脑 PowerShell 查看局域网 IP：

```powershell
ipconfig
```

找到类似：

```text
IPv4 地址 . . . . . . . . . . . . : 192.168.1.23
```

3. 启动时监听局域网：

```powershell
npm run dev -- -H 0.0.0.0
```

4. 手机浏览器访问：

```text
http://你的电脑IP:3000
```

例如：

```text
http://192.168.1.23:3000
```

## 添加到手机桌面

Android Chrome：

1. 打开 `http://电脑IP:3000/frontdesk`
2. 点击右上角菜单
3. 选择“添加到主屏幕”或“安装应用”

iPhone Safari：

1. 打开 `http://电脑IP:3000/frontdesk`
2. 点击分享按钮
3. 选择“添加到主屏幕”

## 推荐演示入口

```text
/frontdesk   前台看板
/ai-call     AI 来电模拟
/staff       员工端
/manager     主管看板
```

## 备注

- 当前没有 Supabase 配置也能演示，会走本地 Demo 数据。
- 手机和电脑同时打开页面时，本地模式会通过浏览器 BroadcastChannel 尝试同步。
- 如果要正式外网访问，建议部署到 Vercel 后再添加到手机桌面。
