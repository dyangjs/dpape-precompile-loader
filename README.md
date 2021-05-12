## Webpack loader for the web precompile Code

## Install

```shell
npm i dpape-precompile-loader -D
```

## Webpack config

```js
module.exports = {
    ...
    module:{
        rules:[
            ...,
            {
                test: /\.(jsx|js|vue)$/,
                loader: "dpape-precompile-loader",
                options:{
                    config:{
                        user_modules:false,
                        logs_modules:true
                    }
                }
            }
        ]
    }
    ...
}
```

## js code

``` js
// #if user_modules
console.log('user_modules');
//# endif user_modules
//# if logs_modules
console.log('logs_modules');
//# endif logs_modules
```

## html code

```html
<!-- #if user_modules -->
<div>User module content</div>
<!-- #endif user_modules -->
<!-- #if logs_modules -->
<div>Logs module content</div>
<!-- #endif logs_modules -->
```

## Note

```
NodeJS environment variable (process.env) must be injected before starting Webpack or it will not be effective
```

