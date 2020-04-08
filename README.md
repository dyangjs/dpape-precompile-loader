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
                    platformName:"platform",
                    configPath:path.join(__dirname,'./config.json')
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

/** HTML Example **/
<!-- #IF DEV -->
<div>开发环境输出</div>
<!-- #IF -->
<!-- #IF PROD -->
<div>生产环境输出</div>
<!-- #IF -->
```


### configPath 应用定制化编译
```javascript
//config.json
{
    "module":{
        "des":"模块1",
        "enabled":true,
        "children":{
            "module-child1":{
                "enabled":true,
                "name":"模块1-子模块1"
            },
            "module-child2":{
                "enabled":true,
                "name":"模块1-子模块2"
            },
            "module-child3":{
                "enabled":true,
                "name":"模块1-子模块3"
            }
        }
    },
    "module1":{
        "des":"模块2",
        "enabled":true,
        "children":{
            "module1-child1":{
                "enabled":true,
                "name":"模块2-子模块1"
            },
            "module1-child2":{
                "enabled":true,
                "name":"模块2-子模块2"
            },
            "module1-child3":{
                "enabled":true,
                "name":"模块2-子模块3"
            }
        }
    },
    "module3":{
        "des":"模块3",
        "enabled":true,
        "children":{
            "module2-child1":{
                "enabled":true,
                "name":"模块3-子模块1"
            },
            "module2-child2":{
                "enabled":true,
                "name":"模块3-子模块2"
            },
            "module2-child3":{
                "enabled":true,
                "name":"模块3-子模块3"
            }
        }
    }
};
/** 配置文件的Key是条件判断 **/
//#IF module
console.log('模块1');
//#IF
```

## 注意
```
nodejs环境变量（process.env）要在启动webpack前注入不然无效
```

