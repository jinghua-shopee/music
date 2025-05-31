#!/bin/bash

# 五线谱简谱学习器 - 一键部署脚本

echo "🎵 五线谱简谱学习器 - 部署脚本"
echo "=================================="

# 检查 Node.js 环境
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 14+"
    exit 1
fi

# 检查 npm 环境
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ 环境检查通过"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 询问部署目标
echo ""
echo "请选择部署目标："
echo "1) H5 (网页版)"
echo "2) 微信小程序"
echo "3) 全部平台"

read -p "请输入选择 (1-3): " choice

case $choice in
    1)
        echo "🌐 构建 H5 版本..."
        npm run build:h5
        
        if [ $? -eq 0 ]; then
            echo "✅ H5 构建完成！"
            echo "📁 构建文件位于: dist/build/h5/"
            echo "🚀 可将该目录部署到任意静态服务器"
            
            # 询问是否启动本地预览
            read -p "是否启动本地预览? (y/N): " preview
            if [[ $preview =~ ^[Yy]$ ]]; then
                echo "🔍 启动本地预览..."
                cd dist/build/h5 && python3 -m http.server 8080 || python -m SimpleHTTPServer 8080
            fi
        else
            echo "❌ H5 构建失败"
            exit 1
        fi
        ;;
        
    2)
        echo "📱 构建微信小程序版本..."
        npm run build:mp-weixin
        
        if [ $? -eq 0 ]; then
            echo "✅ 微信小程序构建完成！"
            echo "📁 构建文件位于: dist/build/mp-weixin/"
            echo "🚀 请用微信开发者工具打开该目录"
            echo ""
            echo "📝 部署步骤："
            echo "1. 打开微信开发者工具"
            echo "2. 导入项目: dist/build/mp-weixin/"
            echo "3. 配置 AppID"
            echo "4. 上传代码并提交审核"
        else
            echo "❌ 微信小程序构建失败"
            exit 1
        fi
        ;;
        
    3)
        echo "🔄 构建全部平台..."
        
        # H5 构建
        echo "🌐 构建 H5..."
        npm run build:h5
        
        # 微信小程序构建
        echo "📱 构建微信小程序..."
        npm run build:mp-weixin
        
        echo ""
        echo "✅ 全部平台构建完成！"
        echo ""
        echo "📁 构建文件："
        echo "  - H5: dist/build/h5/"
        echo "  - 微信小程序: dist/build/mp-weixin/"
        echo ""
        echo "🚀 部署说明："
        echo "  - H5: 部署到静态服务器"
        echo "  - 小程序: 用微信开发者工具打开并上传"
        ;;
        
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署脚本执行完成！"
echo ""
echo "📚 更多部署信息请查看 README.md"
echo "🐛 问题反馈: https://github.com/your-username/music-learning-uniapp/issues" 