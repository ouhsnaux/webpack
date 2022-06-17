# webpack

## 理论

传统的在html中引入js文件，各个js文件间互相引用关系非常隐蔽不直观，webpack可以解决此问题。
并且可以避免变量全局污染。

### 入口

默认入口为 `src/index.js`

### 出口

默认出口为 `dist/main.js`

### mode

#### 开发模式

开发模式和生产模式

source-map，将编译后的文件映射到源文件，当出现错误或警告时方便溯源

### loader

提供编译其他类型文件的能力。可以对同一类型文件使用多个loader，后面的loader先运行，将运行结果返回给前面的loader。

webpack使用正则表达式来检测文件类型。

图片被输出到output中并重命名，html/css/js中引用图片的路径都会被修正。

对于静态资源的处理，让你可以将静态资源与相关文件在同一文件夹下，更加内聚。

## 实践

### 运行

* 本地全局安装webpack，命令行执行 `webpack`，`--config` 指定配置文件。默认是`webpack.config.js`
* 命令行执行 `npx webpack`
* 安装依赖，`package.json scripts` 中添加 `"build": "webpack"`，命令行执行 `npm run build`

* CLI可以通过 `--env` 向配置传递参数，goal=local，production，值默认为true
* 配置文件，module.exports输出函数，第一个参数为参数组成的对象

node版本8.9.10-9.11.1打包性能比较差

### 输入

entry: 字符串或对象

默认入口为 `src/index.js`

### 输出

output: 指定输出配置

filename: 文件名
path: 地址
clean: 每次打包先清理文件夹

#### 文件名

为了避免浏览器缓存带来的问题，在filename中加入 `[contenthash]` ，这样每次打包[contenthash]都会被替换为hash。如果被打包内容发生变化，contenthash也会变更

#### 提取样板

将不太会修改的内容单独打包到一个文件，比如依赖包打包到vendors。

```js
optimization: {
  runtimeChunk: 'single',
  splitChunks: {
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
      }
    }
  }
},
```

#### module ID

<!-- TODO 几年前曾经为此苦恼，但是现在无法复现，提示cached -->
当index变化时，vendor等也被重新编译成hash不同的文件。

optimization中添加：

`moduleIds: 'deterministic',`

#### 编写库

`library: 'libraryName'`，这样库只能通过script标签使用

下面这样使用，打包后支持esm和cjs

```js
library: {
  name: 'libraryName',
  type: 'umd',
}
```

使用externals去除第三方依赖，这样打包内容只有你自己的文件

<!-- TODO package.json main module -->

### 代码分片

#### 根据入口分片

output中filename为 `[name].bundle.js`

问题：

1. 多个文件引用的相同的包不能复用，在不同的文件中存在多份重复代码
2. TODO It isn't as flexible and can't be used to dynamically split code with the core application logic.

#### 避免重复

##### 使用dependOn允许共享代码

```js
module.exports = {
  entry: {
    index: {
      import: './src/index.js',
      dependOn: 'shared',
    },
    another: {
      import: './src/another-module.js',
      dependOn: 'shared',
    },
    shared: 'lodash',
  },
}
```

这样公用代码lodash会另外打一个包。

<!-- TODO optimization runtimeChunk single 会另外生成一个runtime.bundle.js -->

##### splitChunksPlugin

可以将公用依赖提取到同一文件

```js
optimization: {
  splitChunks: {
    chunks: 'all',
  },
},
```

##### mini-css-extract-plugin

将css提取公用

#### 动态导入

* import()

### 开发模式

#### source-map

#### 自动编译

##### watch mode

配置 `package.json scripts`，添加命令 `"watch": "webpack --watch"`

保存后自动编译，需手动刷新浏览器

##### webpack-dev-server

首先安装依赖 `webpack-dev-server`。
配置出口地址，dist
配置 `package.json scripts`，添加命令 `"start": "webpack serve --open"`

执行后自动打开浏览器，并在保存文件后自动编译并刷新浏览器。

编译后不生成文件到硬盘，结果保存到内存中，性能更好

##### webpack-dev-middleware

将 `webpack` 处理的文件提交到一个服务器，`webpack-dev-server` 内部使用此插件。也可以自己搭配一个express启动的服务器。

首先安装express和webpack-dev-middleware

修改 `package.json output` 添加 `publicPath: '/'`

创建server.js

```js
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('./webpack.config');
const compiler = webpack(config);

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  })
);

app.listen(3000, function() {
  console.log('Example app listening on port 3000!\n')
})
```

#### 打包分析

### 打包配置结构

1. webpack.common.js, 公用配置，通过 webpack-merge 复用
2. webpack.dev.js, webpack.prod.jd
3. 修改package.json, scripts

```js
"start": "webpack serve --open --config webpack.dev.js",
"build": "webpack --config webpack.prod.js"
```

### 常用loader

#### 样式

* css-loader
* style-loader

#### 图片

### 常用plugin

* HtmlWebpackPlugin 生成html文件，并更新引用文件的路径。
* mini-css-extract-plugin css提取公共部分
* webpack-bundle-analyzer 打包分析

### 常用工具

* webpack-dev-server

## 工具

### 自定义插件

## vue 源码配置及优化

## react 源码配置及优化

## TODO

* 与mock交互，打包时根据环境及配置控制是否将mock数据打包
  * env externals
* 按需加载
