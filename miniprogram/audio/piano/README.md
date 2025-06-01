# 钢琴音频文件

这个目录用于存放钢琴音符的音频文件。

## 文件命名规范

音频文件应按照以下格式命名：
- `c3.mp3` - C3音符
- `c#3.mp3` - C#3音符（升号）
- `d3.mp3` - D3音符
- 等等...

## 支持的音符

目前支持以下音符（3个八度）：

### 第3八度
- c3, c#3, d3, d#3, e3, f3, f#3, g3, g#3, a3, a#3, b3

### 第4八度（中央C）
- c4, c#4, d4, d#4, e4, f4, f#4, g4, g#4, a4, a#4, b4

### 第5八度
- c5, c#5, d5, d#5, e5, f5, f#5, g5, g#5, a5, a#5, b5

## 音频格式要求

- **格式**: MP3 或 WAV
- **时长**: 1-3秒
- **音质**: 44.1kHz, 16bit 以上
- **文件大小**: 建议每个文件小于 100KB

## 获取音频文件

你可以从以下来源获取钢琴音频文件：

1. **免费资源**:
   - Freesound.org
   - Zapsplat.com
   - OpenGameArt.org

2. **自制录音**:
   - 使用真实钢琴录制
   - 使用音频合成软件（如 Audacity, GarageBand）

3. **购买正版**:
   - AudioJungle
   - Pond5

## 备用方案

如果没有音频文件，应用会自动使用振动反馈作为备用方案。

## 示例代码

```javascript
// 在 audioUtils.js 中使用本地音频文件
getAudioUrl(noteKey) {
  return `/audio/piano/${noteKey}.mp3`
}
``` 