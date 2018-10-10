const RDS = require('react-dom/server');
const React = require('react');
const Helper = require('./Helpers');

class ReactRenderer {
    constructor (Helpers, Config) {
        const config = Config.get('react');
        this.config(config);
        this.files = {};
        this.globals = {};
        this.helper = new Helper(Helpers);
        this.with = this.with.bind(this);
        this.render = this.render.bind(this);
        this.config = this.config.bind(this);
        this.globalsFor = this.globalsFor.bind(this);
    }

    with (args) {
        for (let key in args) {
            this[key] = args[key];
        }
        return this;
    }

    global (field, callback) {
        this.globals[field] = callback;
    }

    async globalsFor (component) {
        const returns = {};
        let {globals} = component;
        if (!globals) {
            return returns;
        } else {
            if (!Array.isArray(globals)) globals = [globals];
        }
        let promise = Promise.resolve();
        for (let key of globals) {
            promise = promise.then(async () => {
                const callback = this.globals[key];
                if (!callback) {
                    throw new Error(`Global function ${key} not set for Adonis/Src/ReactView`);
                }
                returns[key] = await callback(this.req);
            });
        }
        await promise;
        return returns;
    }

    config (config = {toStatic: false, useCustomWrapper: false, wrapperFile: 'wrapper', title: 'Adonis React App'}) {
        this.toStatic = config.toStatic !== undefined ? config.toStatic : false;
        this.useCustomWrapper = config.useCustomWrapper !== undefined ? config.useCustomWrapper : false;
        this.wrapperFile = config.wrapperFile !== undefined ? config.wrapperFile : 'wrapper';
        this.template = config.template !== undefined ? config.template : htmlTemplate;
        this.title = config.title !== undefined ? config.title : 'Adonis React App';
    }
    replaceOnTemplate (options) {
        let template = this.template;
        for (let key in options) {
            template = template.replace(new RegExp('{{' + key + '}}', 'g'), options[key]);
        }
        return template;
    }
    async render (viewName = 'main') {
        // Remove websocket circular references
        const {req: {client, connection, socket, _readableState, ...request}} = this;
        let View = this.files[viewName] || this.helper.parseFile(viewName);
        const globals = await this.globalsFor(View);

        let Wrapper = this.useCustomWrapper ? this.helper.parseFile(this.wrapperFile || 'wrapper') : React.Fragment;
        this.files[viewName] = this.files[viewName] || View;

        let method = this.toStatic ? RDS.renderToStaticMarkup : RDS.renderToString;
        let content;
        if (React.isValidElement(View)) {
            View = React.cloneElement(View, {request: request, ...globals});
            content = method(eval(this.helper.parseCode('<Wrapper>{View}</Wrapper>')));
        } else {
            content = method(eval(this.helper.parseCode('<Wrapper><View request={request} {...globals}/></Wrapper>')));
        }
        return this.replaceOnTemplate({
            content,
            title: this.title,
            viewName,
            stringifiedProps: JSON.stringify({...globals, request: {...request, params: this.params}})
        });
    }
}

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
    <title>{{title}}</title>
</head>
<body>
    <div class="root">{{content}}</div>
    <script>
        window.props = {{stringifiedProps}}
    </script>
    <script src=/vendor.js></script>
    <script src=/{{viewName}}.js></script>
    <script src=/render.js></script>
    <script>
        window.render('{{viewName}}');
    </script>
</body>
</html>`;

module.exports = ReactRenderer;