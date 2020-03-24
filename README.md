## Web Precompile Code

## Install
```shell
npm i uix-precompile-loader -D
```
```javascript
//webpack config
module.exports = {
    module: {
        rules: [
            {
                test: /\.(jsx|tsx|js|ts|vue)$/,
                loader: "uix-precompile-loader",
                options:{
                    /** process.env[`platformName`] */
                    platformName:"platform"
                }
            }
        ]
    }
}
/** Example **/
//#IF DEV
console.log('开发环境输出');
//#IF
//#IF PROD
console.log('生产环境输出');
//#IF
```