const path = require('path')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'vue$': 'vue/dist/vue.esm.js'
      }
    }
  },
  chainWebpack: config => {
    // 处理uni-app的pages
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        // 确保支持uni-app的页面组件
        return options
      })
  },
  transpileDependencies: [
    'uni-app'
  ],
  // 关闭 ESLint
  lintOnSave: false,
  
  // 生产环境配置
  productionSourceMap: false,
  
  // 开发服务器配置
  devServer: {
    port: 8080,
    disableHostCheck: true,
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: '/index.html' }
      ]
    }
  },
  
  // 处理 pages 模式
  pages: {
    index: {
      entry: 'main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  
  // uni-app 编译配置
  pluginOptions: {
    'uni-app': {
      // 其他平台的配置
    }
  }
} 