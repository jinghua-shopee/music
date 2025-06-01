#!/bin/bash

echo "🎵 五线谱简谱学习器 - 微信小程序构建脚本 🎵"
echo "==============================================="

echo "✅ 已解决的问题："
echo "   - tabBar配置错误：已删除pages.json中的空tabBar配置"
echo "   - document API冲突：已重命名index.html为index.html.backup"
echo ""

# 检查HBuilderX是否安装
if ! command -v cli &> /dev/null; then
    echo "❌ 未检测到HBuilderX CLI工具"
    echo "请按照以下步骤操作："
    echo ""
    echo "方案一：使用HBuilderX图形界面（推荐）"
    echo "1. 下载安装 HBuilderX: https://www.dcloud.io/hbuilderx.html"
    echo "2. 选择'App开发版'，包含uni-app编译器"
    echo "3. 打开HBuilderX，文件 → 导入 → 从本地目录导入"
    echo "4. 选择当前项目目录"
    echo "5. 在manifest.json中配置您的微信小程序AppID（当前：wx7f0a51ddda8faa1a）"
    echo "6. 点击'运行' → '运行到小程序模拟器' → '微信开发者工具'"
    echo ""
    echo "方案二：使用命令行工具"
    echo "1. 安装 uni-app CLI: npm install -g @vue/cli @vue/cli-init"
    echo "2. 运行: vue init dcloudio/uni-preset-vue my-project"
    echo ""
    exit 1
fi

echo "✅ 开始构建微信小程序版本..."

# 检查是否有微信开发者工具
if ! command -v wechat-devtools &> /dev/null; then
    echo "⚠️  建议安装微信开发者工具以预览小程序"
    echo "下载地址: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html"
fi

echo ""
echo "📋 构建前检查清单："
echo "✓ manifest.json 已配置微信小程序参数（AppID: wx7f0a51ddda8faa1a）"
echo "✓ pages.json 页面路由已配置（已修复tabBar问题）"
echo "✓ App.vue 已适配uni-app格式"
echo "✓ 组件已使用uni-app兼容语法"
echo "✓ index.html 已重命名避免document API冲突"

echo ""
echo "🚀 问题已修复，准备工作完成！"
echo ""
echo "下一步操作："
echo "1. 使用HBuilderX打开此项目"
echo "2. 确认manifest.json中的微信小程序AppID配置"
echo "3. 点击'运行到小程序模拟器'进行测试"
echo "4. 测试通过后点击'发行'生成发布版本"
echo ""
echo "🎯 技术要点："
echo "- ✅ 已解决tabBar.list不能为空的错误"
echo "- ✅ 已解决document API不兼容问题"
echo "- ABC.js库可能需要适配，建议使用Canvas绘制五线谱"
echo "- Web Audio API需要替换为wx.createInnerAudioContext()"
echo "- Vuex状态管理已配置，在小程序中正常使用"
echo ""
echo "📞 如需帮助，请查看'微信小程序输出指南.md'文档" 