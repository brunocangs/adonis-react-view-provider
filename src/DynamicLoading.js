const fs = require('fs');
const path = require('path');

module.exports = (Helpers, Config) => {
    const readFolder = function (pathToFile) {
        let files = fs.readdirSync(pathToFile);
        files = files.reduce((prev, curr) => {
            if (!curr.match(/^\w+\.jsx?$/)) {
                prev = prev.concat(readFolder(pathToFile + '/' + curr));
            } else {
                prev = prev.concat({
                    filePath: pathToFile,
                    file: curr
                });
            }
            return prev;
        }, []).filter(item => item.file.match(/\.jsx?$/).length > 0);
        return files;
    };
    const useCustomWrapper = Config.get('react.useCustomWrapper');
    const completeImports = function (importsArray) {
        return `        import {hydrate} from 'react-dom';
        import React from 'react';
        window.render = async function (viewName) {
            const useCustomWrapper = ${!!useCustomWrapper} // This comes from config
            const views = {${importsArray.join(',\n')}}
            const {default: Component} = await views[viewName]();
            if(!window) {
                return false;
            } else {
                let Wrapper;
                if(useCustomWrapper) {
                    Wrapper = (await views['wrapper']()).default;
                } else {
                    Wrapper = React.Fragment
                }
                const props = window.props;
                hydrate(React.createElement(Wrapper, null, React.createElement(Component, props)), document.getElementById('root'));
                return true;
            }
        }
    `;
    };

    let files = readFolder(Helpers.viewsPath());

    if (!files.length) {
        throw new Error('There must be at least one file on ' + Helpers.viewsPath() + ', please create it');
    }
    let importArray = [];
    let variablesToObject = [];
    for (let object of files) {
        let {file, filePath} = object;
        const fileName = file.replace(/.jsx?$/, '');
        importArray.push(`${fileName}: () => import(/* webpackChunkName: "${fileName}" */'${path.relative(__dirname, filePath + '/' + file).replace(/\\/g, '/')}')`);
        variablesToObject.push(fileName);
    }

    fs.writeFileSync(path.resolve(__dirname, './renderResolver.js'), completeImports(importArray, variablesToObject));
};
