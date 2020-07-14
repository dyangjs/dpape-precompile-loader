var { getOptions } = require('loader-utils');
import * as fs from 'fs';

type configItem = {
    key: string
    value: boolean
}

const jsCodePrecompile = (source: string, key: string, isPass: boolean = false) => {    
    const matchReg = new RegExp(`\\/\\/\\#IF[\\s]{1,}${key}[\\s]{0,}[\\r\\n]((?!\\#IF)[\\s\\S])+\\/\\/\\#ENDIF[\\s]{1,}${key}[\\s]{0,}[\\r\\n]{0,1}`, 'g');   
    source = source.replace(matchReg, val => {        
        if (!isPass) return '';        
        var regsL = new RegExp(`(\\/\\/\\#IF)((?!\\n\\r)\\s)${key}`);
        var regsR = new RegExp(`((?![\\r|\\n])\\s)*(\\/\\/\\#ENDIF\\s${key})`);
        val = val.replace(regsL, '').replace(regsR, '');
        return val;
    });
    return source;
}

const htmlCodePrecompile = (source: string, key: string, isPass: boolean = false) => {
    const matchReg = new RegExp(`\\<\\!\\-\\-[\\s]{0,}\\#IF[\\s]{1,}${key}[\\s]{0,}\\-\\-\\>[\\r\\n]{0,1}((?!\\/\\/#IF)[\\s\\S])+\\<\\!\\-\\-[\\s]{0,}\\#ENDIF[\\s]{1,}${key}[\\s]{0,}\\-\\-\\>[\\r\\n]{0,1}`, 'g')
    source = source.replace(matchReg, val => {
        if (!isPass) return '';
        var regs = /(\<\!\-\-(\s*)\#IF)((?!\n\r)\s)(((?!(#IF)).)+)(\s*)(\-\-\>)[\r\n]/g;
        var regsR = /(\<\!\-\-(\s*)\#ENDIF)((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)(\s*)(\-\-\>)[\r\n]{0,1}/g;
        val = val.replace(regs, '').replace(regsR,'').replace(/\<\!\-\-/g,'').replace(/\-\-\>/g,'').replace(/\#IF/g,'');
        return val;
    });
    return source;
}

/**
 * 获取配置信息
 */
const GetCondition = (config: any = new Object()): Array<configItem> => {
    let result:Array<configItem> = new Array();
    let copyConfig = JSON.parse(JSON.stringify(config));
    delete copyConfig.common;
    const keys = Object.keys(copyConfig);
    if(config.common){
        const commonKeys = Object.keys(config.common);
        commonKeys.map(key=>{
            const v = config.common[key];
            const value = typeof v === 'object' ? Boolean(v.enabled) : Boolean(v);
            result.push({key:key,value:value});
        });
    }
    const fnAddkey= (data:any = new Object())=>{
        const fnKeys = Object.keys(data);
        fnKeys.map(key=>{
            const v = fnKeys[key];
            const value = typeof v === 'object' ? Boolean(v.enabled) : Boolean(v);
            result.push({
                key:key,
                value:value
            });
        });
    };
    keys.map(key=>{
        const v = copyConfig[key];
        const value = typeof v === 'object' ? Boolean(v.enabled) : Boolean(v);
        result.push({
            key:key,
            value:value
        });
        if(!value) return;
        if(typeof v === 'object' && v.fn) fnAddkey(v.fn);
        if(typeof v === 'object' && !(v instanceof Array) && v.children){
            var childResult = GetCondition(v.children);
            result = result.concat(childResult);
        }
    })
    return result;
};

export default function (source: string) {
    var options = getOptions(this);
    options = options || new Object();
    let configPath = options.configPath;
    let config = options.config;
    if (fs.existsSync(configPath)) {
        try {
            var conditionStr = fs.readFileSync(configPath, 'utf-8');
            config = JSON.parse(conditionStr);
        } catch (e) {
            console.log('The configuration file sequence failed!');
        }
    }
    if (!config) config = new Object();
    const conditionList = GetCondition(config);
    conditionList.map(v => {
        const matchReg = new RegExp(`\\/\\/\\#IF[\\s]{1,}${v.key}[\\s]{0,}[\\r\\n]((?!\\#IF)[\\s\\S])+\\/\\/\\#ENDIF[\\s]{1,}${v.key}[\\s]{0,}[\\r\\n]{0,1}`, 'g');
        if(!source.match(matchReg)) return;
        source = jsCodePrecompile(source, v.key, v.value);
    });
    conditionList.map(v => {
        const matchReg = new RegExp(`\\<\\!\\-\\-[\\s]{0,}\\#IF[\\s]{1,}${v.key}[\\s]{0,}\\-\\-\\>[\\r\\n]{0,1}((?!\\#IF)[\\s\\S])+\\<\\!\\-\\-[\\s]{0,}\\#ENDIF[\\s]{1,}${v.key}[\\s]{0,}\\-\\-\\>[\\r\\n]{0,1}`, 'g')        
        if(!source.match(matchReg)) return;
        source = htmlCodePrecompile(source, v.key, v.value);
    });
    return source;
}