# 微信小程序音频播放实现

## 概述

本项目实现了一个完整的钢琴音频播放系统，用于音乐学习小程序。由于微信小程序不支持 Web Audio API，我们采用了 `wx.createInnerAudioContext()` 和振动反馈的混合方案。

## 核心组件

### 1. 音频管理器 (`utils/audioUtils.js`)

主要功能：
- 音频对象池管理
- 预加载常用音符
- 优雅的错误处理和备用方案
- 支持音阶和和弦播放
- 音量控制和淡出效果

```javascript
// 使用示例
import { audioManager } from '../../utils/audioUtils.js'

// 播放单个音符
audioManager.playNote('c4', {
  volume: 0.8,
  duration: 800,
  fadeOut: true
})

// 播放和弦
audioManager.playChord(['c4', 'e4', 'g4'])

// 播放音阶
audioManager.playScale(['c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4', 'c5'])
```

### 2. 钢琴组件 (`components/piano/`)

特性：
- 支持21键钢琴（3个八度：C3-B5）
- 动态布局和响应式设计
- 触摸反馈和视觉效果
- 内置演示功能（音阶、和弦）
- 横向滚动支持

### 3. Canvas五线谱组件 (`components/vex-staff/`)

特性：
- 基于Canvas 2D的专业五线谱渲染
- 支持高音谱号和拍号显示
- 精确的音符位置计算
- 自动加线功能
- 调试信息显示

## 音频播放方案

### 方案层级

1. **优先方案**: 本地音频文件播放
   - 路径: `/audio/piano/{noteKey}.mp3`
   - 使用 `wx.createInnerAudioContext()`

2. **备用方案**: 振动反馈
   - 根据音符频率调整振动强度
   - 低音：长振动 (`wx.vibrateLong()`)
   - 高音：短振动 (`wx.vibrateShort()`)

### 支持的音符格式

- **音符命名**: c3, c#3, d3, d#3, e3, f3, f#3, g3, g#3, a3, a#3, b3, c4...
- **八度范围**: 第3八度到第5八度
- **升降号**: 使用 `#` 表示升号（如 `c#4`）

## 文件结构

```
miniprogram/
├── utils/
│   └── audioUtils.js          # 音频管理器
├── components/
│   ├── piano/                 # 钢琴组件
│   │   ├── piano.js
│   │   ├── piano.wxml
│   │   ├── piano.wxss
│   │   └── piano.json
│   └── vex-staff/            # Canvas五线谱组件
│       ├── vex-staff.js
│       ├── vex-staff.wxml
│       ├── vex-staff.wxss
│       └── vex-staff.json
├── libs/
│   └── vexflow-min.js        # VexFlow简化版
├── audio/
│   └── piano/                # 音频文件目录
│       ├── README.md         # 音频文件说明
│       ├── c3.mp3           # 钢琴音符文件
│       ├── c#3.mp3          # （需要用户添加）
│       └── ...
└── pages/
    └── learning/             # 学习页面
        ├── learning.js
        ├── learning.wxml
        ├── learning.wxss
        └── learning.json
```

## 如何添加真实音频

### 1. 准备音频文件

- **格式**: MP3 或 WAV
- **命名**: 按照音符格式（如 `c4.mp3`, `c#4.mp3`）
- **时长**: 1-3秒
- **大小**: 建议小于100KB

### 2. 放置文件

将音频文件放入 `miniprogram/audio/piano/` 目录

### 3. 测试播放

```javascript
// 在调试控制台测试
audioManager.playNote('c4')  // 播放C4音符
```

## 性能优化

### 音频预加载

```javascript
// 预加载常用音符
preloadCommonNotes() {
  const commonNotes = ['c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4', 'c5']
  commonNotes.forEach(note => {
    this.preloadNote(note)
  })
}
```

### 内存管理

```javascript
// 组件销毁时清理音频资源
detached() {
  audioManager.stopAll()
}
```

### 错误处理

```javascript
// 音频加载失败自动回退到振动
audio.onError((error) => {
  console.error(`音频加载失败 ${noteKey}:`, error)
  this.audioPool.set(noteKey, null)  // 标记为振动模式
})
```

## 扩展功能

### 音效控制

```javascript
// 启用/禁用音频
audioManager.setAudioEnabled(false)

// 调整音量
audioManager.setVolume(0.5)

// 停止所有音频
audioManager.stopAll()
```

### 高级播放

```javascript
// 播放和弦（错开播放）
audioManager.playChord(['c4', 'e4', 'g4'], {
  volume: 0.7,
  duration: 1000
})

// 播放音阶（间隔播放）
audioManager.playScale(['c4', 'd4', 'e4'], {
  interval: 400,
  volume: 0.8
})
```

## 故障排除

### 常见问题

1. **音频不播放**
   - 检查音频文件是否存在
   - 检查文件路径和命名
   - 查看控制台错误信息

2. **只有振动没有声音**
   - 这是正常的备用方案
   - 添加对应的音频文件即可

3. **性能问题**
   - 减少预加载的音符数量
   - 优化音频文件大小
   - 及时清理不用的音频实例

### 调试方法

```javascript
// 开启调试模式查看详细信息
console.log('音频池状态:', audioManager.audioPool)
console.log('音频是否启用:', audioManager.isAudioEnabled)
```

## 未来改进

1. **动态音频生成**: 使用算法生成钢琴音色
2. **网络音频**: 支持CDN音频资源
3. **音频缓存**: 智能缓存策略
4. **音效增强**: 添加混响、音色调节等效果
5. **MIDI支持**: 支持MIDI文件播放

## 技术注意事项

- 微信小程序音频播放有并发限制
- iOS和Android平台可能有不同的音频延迟
- 音频文件会占用小程序包大小
- 需要考虑用户的流量消耗（如果使用网络音频） 