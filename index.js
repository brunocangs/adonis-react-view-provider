const ServiceProvider = require('@adonisjs/fold').ServiceProvider;
const ReactRenderer = require('./src/Renderer');
const webpack = require('webpack');

class ReactViewProvider extends ServiceProvider {
    register () {
        this.app.singleton('Adonis/Src/ReactView', (app) => {
            const Config = app.use('Adonis/Src/Config');
            const Helpers = app.use('Adonis/Src/Helpers');
            return new ReactRenderer(Helpers, Config);
        });
    }
    doWebpack (Helpers) {
        const webpackConfig = require('./src/webpack.config')(Helpers);
        const compiler = webpack(webpackConfig);
        compiler.run((err, stats) => {
            if (err) {
                console.error(err.stack || err);
                if (err.details) {
                    console.error(err.details);
                }
                return;
            }
            const isDev = process.env.NODE_ENV === 'development';
            if(isDev) {
                if(stats.hasErrors()) {
                    console.log(stats.toJson().errors.join('\n'));
                }
                console.log(stats.toString({colors: true}));
            }
        });
    }
    boot () {
        const {app} = this;
        const Context = app.use('Adonis/Src/HttpContext');
        const Renderer = app.use('Adonis/Src/ReactView');
        const Helpers = app.use('Adonis/Src/Helpers');
        const Config = app.use('Adonis/Src/Config');
        
        Context.getter('view', function () {
            return Renderer.with({req: this.req});
        }, true);
        
        this.doWebpack(Helpers);
        
        require('./src/DynamicLoading')(Helpers, Config);
    }
}

module.exports = ReactViewProvider;