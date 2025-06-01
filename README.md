# 五线谱简谱学习器 uni-app版

## 项目简介

这是一个基于uni-app开发的音乐学习应用，主要功能包括：

- 🎼 五线谱学习
- 🎵 简谱学习  
- 🎹 钢琴模拟器
- 📚 练习模式
- 🏆 PK模式
- 📱 跨平台支持（H5、微信小程序、App）

## 技术栈

- **框架**: uni-app (基于Vue 2.6.11)
- **状态管理**: Vuex 3.2.0
- **样式**: SCSS
- **构建工具**: Vue CLI

## 安装与运行

### 环境要求

- Node.js >= 12.0.0
- npm >= 6.0.0

### 安装依赖

```bash
npm install
```

### 开发调试

#### H5端
```bash
npm run dev:h5
# 或者
npm run serve
```

访问地址：http://localhost:8080

#### 微信小程序端
```bash
npm run dev:mp-weixin
```

#### App端
```bash
npm run dev:app-plus
```

### 生产构建

#### H5端
```bash
npm run build:h5
# 或者
npm run build
```

#### 微信小程序端
```bash
npm run build:mp-weixin
```

#### App端
```bash
npm run build:app-plus
```

## 项目结构

```
src/
├── components/          # 组件目录
│   ├── HomePage.vue    # 首页组件
│   ├── LearningPage.vue # 学习页面组件
│   ├── Staff/          # 五线谱相关组件
│   ├── Piano/          # 钢琴相关组件
│   └── Jianpu/         # 简谱相关组件
├── pages/              # 页面目录
│   ├── index/          # 首页
│   └── learning/       # 学习页
├── store/              # Vuex状态管理
├── static/             # 静态资源
├── App.vue             # 应用入口
├── main.js             # 主入口文件
├── manifest.json       # 应用配置
├── pages.json          # 页面路由配置
└── uni.scss           # 样式变量
```

## 功能特性

### 🎼 五线谱学习
- 音符识别训练
- 节拍练习
- 音高辨识

### 🎵 简谱学习
- 数字简谱对照
- 调式训练
- 音程练习

### 🎹 钢琴模拟器
- 虚拟钢琴键盘
- 音符播放
- 和弦练习

### 📚 练习模式
- 循序渐进的学习路径
- 难度分级
- 进度追踪

### 🏆 PK模式
- 竞技学习
- 排行榜系统
- 成就系统

## 开发指南

### 组件开发
- 所有页面级组件放在 `pages/` 目录
- 可复用组件放在 `components/` 目录
- 使用 `view`、`text` 等uni-app标准组件

### 样式规范
- 使用rpx单位适配不同屏幕
- 遵循uni-app样式变量规范
- 支持SCSS语法

### 状态管理
- 使用Vuex管理全局状态
- 学习进度、用户设置等持久化存储

## 部署说明

### H5部署
构建后的文件在 `dist/build/h5/` 目录，可直接部署到静态服务器。

### 微信小程序
1. 运行 `npm run build:mp-weixin`
2. 使用微信开发者工具打开 `dist/build/mp-weixin/` 目录
3. 配置小程序AppID并上传

### App打包
1. 运行 `npm run build:app-plus`
2. 使用HBuilderX或其他打包工具进行原生打包

## 版本更新

### v1.0.0
- ✅ 完成Vue.js项目到uni-app的迁移
- ✅ 支持H5、微信小程序、App多端运行
- ✅ 保留所有原有功能特性
- ✅ 优化移动端交互体验

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交Issue或联系开发团队。 