        import {hydrate} from 'react-dom';
        import React from 'react';
        window.render = async function (viewName) {
            const useCustomWrapper = false // This comes from config
            const views = {newfile: () => import(/* webpackChunkName: "newfile" */'../../../resources/views/lala/newfile.js'),
main: () => import(/* webpackChunkName: "main" */'../../../resources/views/main.js'),
users: () => import(/* webpackChunkName: "users" */'../../../resources/views/users.js'),
wrapper: () => import(/* webpackChunkName: "wrapper" */'../../../resources/views/wrapper.js')}
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
    