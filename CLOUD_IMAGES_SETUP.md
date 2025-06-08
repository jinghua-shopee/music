# 🎼 五线谱云端图片设置说明

## 📝 概述

本项目已经从本地静态图片改为使用云端图片存储，所有五线谱图片都存储在腾讯云对象存储中，并在小程序启动时自动下载到本地缓存。

## 🌐 云端图片地址

**基础URL**: `https://music-1253799806.cos.ap-guangzhou.myqcloud.com/pic/`

**图片命名规则**: `{clef}_{noteName}_{position}.png`
- `clef`: 谱号类型 (`treble` 或 `bass`)
- `noteName`: 音符名称 (如 `C4`, `D4`, `A4` 等)
- `position`: 五线谱位置 (如 `第2间`, `第3线`, `上加2线` 等)

**示例图片URL**:
- `https://music-1253799806.cos.ap-guangzhou.myqcloud.com/pic/treble_C4_%E7%AC%AC2%E9%97%B4.png`
- `https://music-1253799806.cos.ap-guangzhou.myqcloud.com/pic/bass_A4_%E4%B8%8A%E5%8A%A02%E7%BA%BF.png`

## 🔧 技术实现

### 1. 图片管理器 (`miniprogram/utils/imageManager.js`)

负责管理云端图片的下载和本地缓存：

- **自动下载**: 小程序启动时自动下载所有需要的图片
- **本地缓存**: 图片保存在 `${wx.env.USER_DATA_PATH}/staff_images/` 目录
- **智能检查**: 如果本地已存在图片，跳过下载
- **错误处理**: 下载失败时提供重试机制
- **进度监控**: 实时显示下载进度

### 2. 应用启动流程 (`miniprogram/app.js`)

```javascript
async onLaunch() {
  // 初始化图片管理器
  await this.initializeImages()
}
```

- 在 `onLaunch` 中异步初始化图片下载
- 提供全局状态管理和进度回调
- 支持重新下载功能

### 3. 五线谱组件 (`miniprogram/components/staff-image/staff-image.js`)

```javascript
// 获取本地缓存的图片路径
const localImagePath = imageManager.getLocalImagePath(noteName, clef)

if (localImagePath) {
  // 使用本地缓存图片
  this.setData({ staffImageSrc: localImagePath })
} else {
  // 使用远程图片作为备选
  const fallbackImageSrc = this.getFallbackImagePath(note)
  this.setData({ staffImageSrc: fallbackImageSrc })
}
```

- 优先使用本地缓存图片
- 缓存不可用时自动回退到远程图片
- 支持加载状态和错误处理

## 📊 图片配置

### 高音符号 (Treble Clef) - 25张图片
```
A2 (下加3线) → D6 (上加5线)
```

### 低音符号 (Bass Clef) - 29张图片  
```
C1 (下加7线) → C5 (上加3线)
```

**总计**: 54张PNG图片

## 🎯 用户体验

### 首页下载状态显示
- ⬇️ **下载中**: 显示进度条和百分比
- ✅ **下载完成**: 显示成功提示
- ⚠️ **下载失败**: 显示错误信息和重试按钮

### 功能限制
- 图片未下载完成时，学习功能被禁用
- 提供清晰的状态提示和用户引导

## 🔄 缓存管理

### 本地缓存位置
```
${wx.env.USER_DATA_PATH}/staff_images/
├── treble_C4_第2间.png
├── treble_D4_第3线.png
├── bass_A4_上加2线.png
└── ...
```

### 缓存策略
- **持久化**: 图片缓存在用户数据目录，不会被系统清理
- **增量下载**: 只下载不存在的图片
- **手动清理**: 提供清理缓存的API方法

## 🛠️ 开发调试

### 测试页面
访问 `/pages/test-staff/test-staff` 可以：
- 查看图片下载状态
- 测试五线谱组件显示
- 切换不同音符进行测试
- 查看本地缓存和远程图片路径

### 调试信息
```javascript
// 获取下载进度
const progress = app.getImageDownloadProgress()
console.log('下载进度:', progress)

// 获取图片路径
const imagePath = imageManager.getLocalImagePath('C4', 'treble')
console.log('图片路径:', imagePath)
```

## 📱 性能优化

### 下载优化
- **并发下载**: 使用 `Promise.allSettled` 并发下载所有图片
- **错误隔离**: 单个图片下载失败不影响其他图片
- **状态管理**: 精确跟踪每张图片的下载状态

### 内存优化
- **按需加载**: 组件只在需要时加载图片
- **缓存复用**: 相同音符复用已缓存的图片
- **错误回退**: 本地图片失败时自动使用远程图片

## 🚀 部署说明

### 云端图片要求
1. 所有图片必须上传到指定的云存储位置
2. 图片命名必须严格按照规则：`{clef}_{noteName}_{position}.png`
3. 图片需要支持跨域访问（小程序域名白名单）

### 小程序配置
确保在 `app.json` 中配置了网络请求域名：
```json
{
  "networkTimeout": {
    "downloadFile": 60000
  }
}
```

## 🔍 故障排除

### 常见问题

1. **图片下载失败**
   - 检查网络连接
   - 确认云存储图片是否存在
   - 查看控制台错误信息

2. **图片显示异常**
   - 检查图片命名是否正确
   - 确认本地缓存目录权限
   - 尝试清理缓存重新下载

3. **下载进度卡住**
   - 检查并发下载限制
   - 确认小程序网络权限
   - 重启小程序重新下载

### 调试命令
```javascript
// 清理所有缓存
await imageManager.clearCache()

// 重新初始化
await imageManager.initialize()

// 获取详细状态
console.log(imageManager.getDownloadProgress())
```

## 📈 未来优化

1. **增量更新**: 支持图片版本管理和增量更新
2. **压缩优化**: 根据设备性能动态选择图片质量
3. **预加载策略**: 智能预测用户需要的图片并提前下载
4. **离线支持**: 完善离线模式下的图片显示策略 