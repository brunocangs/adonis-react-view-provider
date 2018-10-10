const babel = require('@babel/core');
const path = require('path');
const babelConfig = {presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: [['transform-assets', {
        name: '[name].[ext]',
        publicPath: '/',
        extensions: ['.css','.png','.jpg','.svg']
    }]]};
const {ioc} = require('@adonisjs/fold');

module.exports = class Helpers {
    constructor (Helpers) {
        this.helper = Helpers;
    }
    parseFile (fileName, fromCurrentDirectory) {
        let code;
        if(fromCurrentDirectory) {
            code = babel.transformFileSync(this.helper.viewsPath(fileName + '.js'), babelConfig).code;
        } else {
            if (fileName.indexOf('.')) {
                fileName = fileName.split('.');
                fileName = fileName.length ? fileName : [fileName];
                fileName[fileName.length -1] = fileName[fileName.length -1] + '.js';
                code = babel.transformFileSync(path.resolve(this.helper.viewsPath(), ...fileName), babelConfig).code;
            }
        }
        code = eval(code);
        if (code.default) {code = code.default;}
        return code;
    }

    parseCode (input) {
        return babel.transformSync(input, babelConfig).code;
    }
};