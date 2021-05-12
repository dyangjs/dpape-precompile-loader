var { spawn } = require('child_process');
var spin = require('io-spin');
var UglifyJS = require("uglify-js");
var path = require('path');
var fs = require('fs');

const spawnAsync = (prefix, params = []) => {
    return new Promise((resolve, rejecet) => {
        const win = process.platform == 'win32';
        const prefixCmd = `${prefix}${win ? '.cmd' : ''}`;
        const cmd = spawn(prefixCmd, params, {
            cwd: path.join(__dirname, '../'),
            stdio: 'inherit'
        });
        cmd.on('exit', resolve);
    });
}

const removeListFile = (distPath) => {
    return new Promise((resolve) => {
        const FolderPath = distPath ? distPath : path.resolve(__dirname, '../lib');
        if (!fs.existsSync(FolderPath)) {
            resolve();
            return;
        }
        const files = fs.readdirSync(FolderPath);
        files.forEach(async file => {
            const curPath = path.join(FolderPath, `./${file}`);
            if (fs.statSync(curPath).isDirectory()) {
                await removeListFile(curPath);
                return;
            };
            console.log(`Remove file [${file}] was successful`);
            fs.unlinkSync(curPath); //删除文件
        });
        fs.rmdirSync(FolderPath);
        resolve();
    });
}

const CompressionCode = async(distPath) => {
    return new Promise((resolve) => {
        const FolderPath = distPath ? distPath : path.resolve(__dirname, '../lib');
        if (!fs.existsSync(FolderPath)) {
            resolve();
            return;
        }
        const files = fs.readdirSync(FolderPath);
        files.forEach(async file => {
            const curPath = path.join(FolderPath, `./${file}`);
            if (fs.statSync(curPath).isDirectory()) {
                await CompressionCode(curPath);
                return;
            };
            const nominifyList = ['axios.js', 'react.index.js', 'vue.index.js', 'vue.routers.js'];
            if (file.indexOf('.js') < 0 || nominifyList.indexOf(file) >= 0) return;
            const code = fs.readFileSync(curPath, 'utf-8');
            var result = UglifyJS.minify(code);
            var minifyCode = result.code;
            fs.writeFileSync(curPath, minifyCode, 'utf-8');
            // fs.writeFileSync(curPath, code, 'utf-8');
            console.log(`Compression js file [${file}] was successful`);
        });
        resolve();
    });
}

const builds = async() => {
    console.log('Build cli...');
    const spinner = spin('Remove old the lib files...');
    spinner.start();
    try {
        await removeListFile();
        spinner.update('Build Ts code ...');
        await spawnAsync('npx',['tsc']);
        console.log('Ts code build was successful');
        spinner.update('Compression code ...');
        await CompressionCode();
        spinner.stop();
        console.log('Building completed')
    } catch (err) {
        spinner.stop();
    }
};

builds();