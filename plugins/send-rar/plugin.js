const player = require('play-sound')();
const compressing = require('compressing');
const nodemailer = require('nodemailer');

// TODO 此播放插件有些设备不可用，待优化
module.exports = class MyPlugin {
  apply(compiler) {
    // 打包结束后执行
    compiler.hooks.done.tap('my-plugin', () => {
      // 首先压缩
      compressing.zip
        .compressDir('./dist', './dist.zip')
        .then(() => {
          console.log('success');
          // 成功后发邮件
          // 创建
          const transporter = nodemailer.createTransport({
            host: 'smtp.exmail.qq.com', // 使用内置的163发送邮件
            port: 465,
            secure: true,
            auth: {
              user: 'xxx@xxx.com',
              // 邮箱安全码
              pass: 'xxxcodexxxxx',
            },
          });
          // 校验能否发送
          transporter.verify(function (error, success) {
            if (error) {
              console.log(error);
            } else {
              console.log('email is ready');
            }
          });
          // 发送邮件
          transporter.sendMail({
            from: 'sender@xxx.com',
            to: 'receiver@xxx.com',
            subject: '前端代码压缩包',
            attachments: [
              {
                filename: 'dist.zip', // 附件名称
                path: './dist.zip', // 附件的位置
              },
            ],
          });
        })
        .catch((err) => {
          // 打包失败播放提示音
          console.error(err);
          player.play('./ding.wav', (err) => {
            if (err) console.log(`Could not play sound: ${err}`);
          });
        });
    });
  }
};
