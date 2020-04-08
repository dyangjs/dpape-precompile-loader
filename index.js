var utils = require('loader-utils');
var fs = require('fs');
var getOptions = utils.getOptions;
var otherPrecompile = function(source,condition){
    var reg = /(\/\/\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n](((?!(#[i|I][f|F]))[\s\S])+)[\r\n]((?![\r|\n])\s)*(\/\/\#[i|I][f|F])/g;
    condition = condition || new Array();
    if(!source) return source;
    source = source.replace(reg,value=>{
        var regs = /(\/\/\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n]/g;
        let platformValue = "";
        value.replace(regs, env => {
            platformValue = env.replace(/\/\/\#[i|I][f|F]/g, '').trim();
            return env;
        });
        if (condition.indexOf(platformValue) >= 0) {
            var regsL = /(\/\/\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n]/g;
            var regsR = /[\r\n]((?![\r|\n])\s)*(\/\/\#[i|I][f|F])[\r\n]{0,1}/g;
            value = value.replace(regsL, '').replace(regsR, '');
            return value;
        }
        return '';
    });
    return source;
    
};
var htmlPrecompile = function(source,condition){
    var reg = /(\<\!\-\-(\s*)\#[i|I][f|F])(((?!(#[i|I][f|F]))[\s\S])+)(((?!(#[i|I][f|F|]))[\s\S])+)(\#[i|I][f|F](\s*)\-\-\>)/g;
    condition = condition || new Array();
    if(!source) return source;
    source = source.replace(reg,value=>{
        var regs = /(\<\!\-\-(\s*)\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)(\s*)(\-\-\>)[\r\n]/g;
        let platformValue = "";
        value.replace(regs, env => {
            platformValue = env.replace(/\<\!\-\-/g,'').replace(/\-\-\>/g,'').replace(/\#IF/g,'').trim();
            return env;
        });
        if (condition.indexOf(platformValue) >= 0) {
            value = value.replace(regs, '').replace(/\<\!\-\-/g,'').replace(/\-\-\>/g,'').replace(/\#IF/g,'').trim();
            return value;
        }
        return '';
    });
    return source;
};
var recursionGetCondition = (data)=>{
    data = data || new Object();
    var result = new Array();
    const keys = Object.keys(data);
    keys.map(key=>{
        const val = data[key];
        var enabled = false;
        if(typeof val === 'boolean') enabled = val;
        if(typeof val === 'object' && !(val instanceof Array)){
            enabled = Boolean(val.enabled);
        }
        if(enabled) result.push(key);
        if(!enabled) return;
        if(typeof val === 'object' && !(val instanceof Array) && val.children){
            var childResult = recursionGetCondition(val.children);
            result = result.concat(childResult);
        }
    });
    return result;
}
module.exports = function(source) {
    var options = getOptions(this);
    options = options || new Object();
    let configPath = options.configPath;
    var condition = new Array();
    if(fs.existsSync(configPath)){
        try{
            var conditionStr = fs.readFileSync(configPath,'utf-8');
            var configPathJson = JSON.parse(conditionStr);
            condition = recursionGetCondition(configPathJson);
        }catch(e){
            console.error('The configuration file sequence failed!');
        }
    }else{
        var name = options.platformName || 'platform';
        var platform = process.env[name] || '';
        condition = platform.split(',');
    };
    source = otherPrecompile(source,condition);
    source = htmlPrecompile(source,condition);
    return source;
}