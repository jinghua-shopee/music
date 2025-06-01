module.exports = {
  configureWebpack: {
    entry: {
      app: './main.js'
    },
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname)
      }
    }
  },
  
  transpileDependencies: [],
  
  // 关闭 ESLint
  lintOnSave: false,
  
  // 生产环境配置
  productionSourceMap: false,
  
  // 输出目录
  outputDir: 'dist',
  
  // 静态资源目录
  assetsDir: 'static',
  
  // 开发服务器配置
  devServer: {
    port: 8080,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    // 禁用 host 检查
    disableHostCheck: true
  },
  
  // 处理 pages 模式
  pages: {
    index: {
      entry: 'main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  }
} 