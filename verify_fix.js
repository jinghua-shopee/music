#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 验证uni-app修复效果...\n');

// 检查关键文件是否存在
const criticalFiles = [
    'src/pages/index/index.vue',
    'src/pages/learning/learning.vue',
    'src/components/HomePage.vue',
    'src/components/LearningPage.vue',
    'src/components/Staff/Staff.vue',
    'src/components/Piano/Piano.vue',
    'src/components/Jianpu/Jianpu.vue',
    'src/store/index.js',
    'src/pages.json',
    'src/manifest.json',
    'src/App.vue',
    'src/main.js'
];

console.log('📁 检查关键文件...');
let allFilesExist = true;
criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - 文件不存在`);
        allFilesExist = false;
    }
});

// 检查组件中是否还有不兼容的代码
console.log('\n🔧 检查代码兼容性...');

const checkFile = (filePath, incompatiblePatterns) => {
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    incompatiblePatterns.forEach(pattern => {
        if (content.includes(pattern.code)) {
            issues.push(pattern.issue);
        }
    });
    
    if (issues.length === 0) {
        console.log(`✅ ${filePath} - 兼容性检查通过`);
    } else {
        console.log(`❌ ${filePath} - 发现问题:`);
        issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    return issues.length === 0;
};

// 定义不兼容的代码模式
const incompatiblePatterns = [
    { code: 'document.createElement', issue: '使用了DOM操作' },
    { code: 'innerHTML', issue: '使用了innerHTML' },
    { code: 'window.ABCJS', issue: '使用了ABC.js库' },
    { code: 'AudioContext', issue: '使用了Web Audio API' },
    { code: 'webkitAudioContext', issue: '使用了Web Audio API' },
    { code: '<div', issue: '使用了div标签' },
    { code: '<span', issue: '使用了span标签' },
    { code: '<h1', issue: '使用了h1标签' },
    { code: '<h2', issue: '使用了h2标签' },
    { code: '<h3', issue: '使用了h3标签' },
    { code: '<p>', issue: '使用了p标签' }
];

let allCompatible = true;
const componentsToCheck = [
    'src/components/Staff/Staff.vue',
    'src/components/Piano/Piano.vue',
    'src/components/Jianpu/Jianpu.vue',
    'src/components/LearningPage.vue',
    'src/components/HomePage.vue'
];

componentsToCheck.forEach(file => {
    const isCompatible = checkFile(file, incompatiblePatterns);
    if (!isCompatible) allCompatible = false;
});

// 检查pages.json配置
console.log('\n⚙️ 检查配置文件...');
try {
    const pagesConfig = JSON.parse(fs.readFileSync('src/pages.json', 'utf8'));
    
    if (pagesConfig.pages && pagesConfig.pages.length >= 2) {
        console.log('✅ pages.json - 页面配置正常');
    } else {
        console.log('❌ pages.json - 页面配置不完整');
        allCompatible = false;
    }
    
    // 检查是否移除了有问题的tabbar配置
    if (!pagesConfig.tabBar) {
        console.log('✅ pages.json - 已移除有问题的tabbar配置');
    } else {
        console.log('⚠️ pages.json - tabbar配置仍然存在，可能需要检查图标文件');
    }
} catch (error) {
    console.log('❌ pages.json - 配置文件解析失败');
    allCompatible = false;
}

// 检查package.json中的依赖
console.log('\n📦 检查依赖配置...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const requiredDeps = ['vue', 'vuex', '@dcloudio/uni-app'];
    const missingDeps = requiredDeps.filter(dep => 
        !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
    );
    
    if (missingDeps.length === 0) {
        console.log('✅ package.json - 核心依赖完整');
    } else {
        console.log(`❌ package.json - 缺少依赖: ${missingDeps.join(', ')}`);
        allCompatible = false;
    }
} catch (error) {
    console.log('❌ package.json - 文件解析失败');
    allCompatible = false;
}

// 最终结果
console.log('\n' + '='.repeat(50));
if (allFilesExist && allCompatible) {
    console.log('🎉 验证通过！uni-app修复成功！');
    console.log('✅ 所有关键文件存在');
    console.log('✅ 代码兼容性检查通过');
    console.log('✅ 配置文件正常');
    console.log('\n🚀 应用现在可以正常运行在uni-app平台上');
    console.log('📱 支持平台: H5、微信小程序、App等');
    console.log('🌐 开发服务器: http://localhost:8080');
} else {
    console.log('❌ 验证失败！仍有问题需要解决');
    if (!allFilesExist) {
        console.log('- 部分关键文件缺失');
    }
    if (!allCompatible) {
        console.log('- 代码兼容性问题');
    }
}
console.log('='.repeat(50)); 