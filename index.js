var utils = require('loader-utils');
var getOptions = utils.getOptions;
module.exports = function(source) {
    var options = getOptions(this);
    options = options || new Object();
    var reg = /(\/\/\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n](((?!(#[i|I][f|F]))[\s\S])+)[\r\n]((?![\r|\n])\s)*(\/\/\#[i|I][f|F])/g;
    var htmlReg = /(\<\!\-\-\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n](((?!(#[i|I][f|F]))[\s\S])+)[\r\n]((?![\r|\n])\s)*(\#[i|I][f|F]\-\-\>)/g;
    var name = options.platformName || 'platform';
    var platform = process.env[name] || '';
    var platformDatas = platform.split(',');
    source = source.replace(reg, value => {
        var regs = /(\/\/\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n]/g;
        let platformValue = "";
        value.replace(regs, env => {
            platformValue = env.replace(/\/\/\#[i|I][f|F]/g, '').trim();
            return env;
        });
        if (platformDatas.indexOf(platformValue) >= 0) {
            var regsL = /(\/\/\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n]/g;
            var regsR = /[\r\n]((?![\r|\n])\s)*(\/\/\#[i|I][f|F])[\r\n]{0,1}/g;
            value = value.replace(regsL, '').replace(regsR, '');
            return value;
        }
        return '';
    });
    source = source.replace(htmlReg, value => {
        var regs = /(\<\!\-\-\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n]/g;
        let platformValue = "";
        value.replace(regs, env => {
            platformValue = env.replace(/\<\!\-\-\#[i|I][f|F]/g, '').trim();
            return env;
        });
        if (platformDatas.indexOf(platformValue) >= 0) {
            var regsL = /(\<\!\-\-\#[i|I][f|F])((?!\n\r)\s)(((?!(#[i|I][f|F])).)+)[\r\n]/g;
            var regsR = /[\r\n]((?![\r|\n])\s)*(\#[i|I][f|F]\-\-\>)[\r\n]{0,1}/g;
            value = value.replace(regsL, '').replace(regsR, '');
            return value;
        }
        return '';
    });
    return source;
}