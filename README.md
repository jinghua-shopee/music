# 五线谱简谱学习器 - uni-app版

一个专业的五线谱简谱对照学习应用，支持多平台部署（H5、微信小程序、iOS、Android）。

## ✨ 功能特性

### 🎵 学习模式
- **练习模式**：专注学习，稳步提升
  - 支持30道题、60道题、无尽模式
  - 实时显示五线谱和简谱对照
  - 暂停/继续功能
  - 详细统计分析
  
- **PK模式**：双人对战，竞技乐趣
  - 30道题、60道题对战
  - 玩家切换过渡动画
  - 多维度对比结算
  - 胜利者皇冠动效

### 🎹 交互体验
- **钢琴键盘**：可视化音符选择
  - 完整88键钢琴键盘
  - 白键黑键真实布局
  - 中央C特殊标识
  - 音符播放反馈

### 📊 数据分析
- **实时统计**：学习过程全记录
  - 答题准确率统计
  - 反应时间分析
  - 暂停时间处理
  - 音符成功率跟踪

- **数据存储**：云端数据库
  - 用户学习记录
  - 音符统计分析
  - PK对战历史
  - 学习进度追踪

### 🎨 UI设计
- **现代化界面**：毛玻璃效果、渐变背景
- **响应式设计**：完美适配手机、平板
- **动画效果**：流畅的过渡和微交互
- **多主题适配**：自动适应系统主题

## 🚀 快速开始

### 环境要求
- Node.js 14+
- npm 6+ 或 yarn 1.22+
- HBuilderX 3.0+ (推荐)

### 安装依赖
```bash
npm install
```

### 开发调试

#### H5 开发
```bash
npm run dev:h5
```
访问 http://localhost:3000

#### 微信小程序开发
```bash
npm run dev:mp-weixin
```
然后用微信开发者工具打开 `dist/dev/mp-weixin` 目录

#### App 开发
```bash
npm run dev:app
```

### 生产构建

#### H5 构建
```bash
npm run build:h5
```

#### 微信小程序构建
```bash
npm run build:mp-weixin
```

#### App 构建
```bash
npm run build:app
```

## 📱 平台部署

### H5 部署
1. 构建项目：`npm run build:h5`
2. 将 `dist/build/h5` 目录部署到任意静态服务器
3. 支持 PWA，可添加到主屏幕

### 微信小程序部署
1. 构建项目：`npm run build:mp-weixin`
2. 用微信开发者工具打开 `dist/build/mp-weixin`
3. 配置小程序信息并上传审核
4. 注意：需要配置合法域名和数据库权限

### App 部署
1. 构建项目：`npm run build:app`
2. 用 HBuilderX 打开项目
3. 发行 -> 原生App云打包
4. 支持 iOS App Store 和 Android 应用商店

## 🗃️ 项目结构

```
├── pages/                  # 页面文件
│   ├── index/              # 首页
│   └── learning/           # 学习页面
├── components/             # 组件库
├── utils/                  # 工具库
│   ├── database.js         # 数据库操作
│   └── music.js            # 音乐相关工具
├── static/                 # 静态资源
│   └── js/                 # JavaScript库
├── App.vue                 # 应用入口
├── main.js                 # 主入口文件
├── manifest.json           # 应用配置
├── pages.json              # 页面路由配置
└── vite.config.js          # 构建配置
```

## 🔧 技术栈

- **框架**：uni-app 3.0 + Vue 3
- **构建**：Vite 5.0
- **数据库**：Turso (SQLite)
- **五线谱渲染**：ABCJS
- **音频**：Web Audio API
- **样式**：原生CSS + 响应式设计

## 🌟 特色功能

### 五线谱渲染
- 基于 ABCJS 库实现专业五线谱渲染
- 支持各种音符、调号、拍号
- 自适应大小和样式

### 音频播放
- Web Audio API 原生音频合成
- 真实钢琴音色模拟
- 低延迟音频反馈

### 数据持久化
- 云端数据库存储
- 用户设备指纹识别
- 离线数据同步支持

### 跨平台兼容
- 统一的代码库
- 平台特性适配
- 原生性能优化

## 📊 数据库设计

### 用户表 (users)
- id: 用户ID
- identifier: 设备指纹
- created_at: 创建时间

### 学习会话表 (learning_sessions)
- id: 会话ID
- user_id: 用户ID
- mode: 学习模式
- question_count: 题目数量
- start_time/end_time: 开始/结束时间
- total_questions: 总题数
- correct_answers: 正确数
- accuracy_rate: 准确率
- avg_reaction_time: 平均反应时间

### 题目记录表 (question_records)
- session_id: 会话ID
- note_name: 音符名称
- note_octave: 八度
- user_answer: 用户答案
- is_correct: 是否正确
- reaction_time: 反应时间
- pause_duration: 暂停时长

### 音符统计表 (note_statistics)
- user_id: 用户ID
- note_name: 音符名称
- note_octave: 八度
- total_attempts: 总尝试次数
- correct_attempts: 正确次数
- success_rate: 成功率
- avg_reaction_time: 平均反应时间

### PK对战表 (pk_battles)
- user_id: 用户ID
- p1_total/p2_total: 玩家总题数
- p1_correct/p2_correct: 玩家正确数
- p1_accuracy/p2_accuracy: 玩家准确率
- p1_avg_reaction/p2_avg_reaction: 玩家平均反应时间
- winner: 获胜者

## 🛠️ 开发指南

### 添加新音符
在 `utils/music.js` 的 `notes` 数组中添加：
```javascript
{
  id: 'C4',
  name: 'C',
  octave: 4,
  abc: 'C',
  frequency: 261.63,
  jianpu: '1',
  clef: 'treble',
  isLedger: true,
  position: 0.5
}
```

### 自定义主题
修改 `App.vue` 中的全局样式变量：
```css
:root {
  --primary-color: #007AFF;
  --gradient-start: #667eea;
  --gradient-end: #764ba2;
}
```

### 添加新平台
1. 在 `manifest.json` 中添加平台配置
2. 在 `package.json` 中添加构建脚本
3. 在代码中使用条件编译 `#ifdef MP-PLATFORM`

## 🎯 性能优化

- **代码分割**：按页面自动分割代码
- **资源预加载**：关键资源预加载
- **图片优化**：WebP格式支持
- **缓存策略**：静态资源长缓存
- **懒加载**：非关键组件懒加载

## 🐛 问题排查

### 常见问题

1. **ABCJS 在小程序不工作**
   - 小程序不支持 DOM 操作，需要使用 Canvas 替代方案

2. **音频播放无声音**
   - 检查 Web Audio API 兼容性
   - 确保用户交互后才播放音频

3. **数据库连接失败**
   - 检查网络配置和域名白名单
   - 验证数据库凭据

### 调试技巧
- 使用 `console.log` 进行调试
- H5 可使用浏览器开发者工具
- 小程序使用微信开发者工具调试面板

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系我们

- 项目地址：[GitHub](https://github.com/your-username/music-learning-uniapp)
- 问题反馈：[Issues](https://github.com/your-username/music-learning-uniapp/issues)

---

**五线谱简谱学习器** - 让音乐学习更简单，更有趣！🎵 