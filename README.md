## About

This is a package to enable usage of react with [AdonisJS](https://adonisjs.com/) APIs.

## Installation

First, download the package by running

`npm install -s adonis-react-view-provider react`

***Note:*** React is a peer dependency in order to facilitate versioning

Then, on your `app.js` file in the `start` folder, add

```javascript
const providers = [
    '@adonisjs/framework/providers/AppProvider',
    ...
+++ 'adonis-react-view-provider'
]
```

Once that's done, you have to create your views folder and view files, such as `/resources/views/main.js` and the package will take care of code splitting and properly rendering your views both on the server and the client.

### Note
It's recommended to start your project with --api-only, as I'm not sure to how it interacts with the default view provider.

## Usage

This provider supports both stateless and React components, so you can continue developing just as you're used to

You can directly access the provider with `use('ReactView')` to define globals, functions that allow you to pass information from Controllers and Models into your components

### Defining globals

To define globals, you can do as in the example bellow

```javascript
const View = use('ReactView');
View.global('users', (request) => {
    return use('App/Model/Users').all()
})
```

The function will be called with `await`, and passed the `Request` object as a parameter.

### Using globals

Globals will be automatically loaded into component props, but first you need to define a `globals` static on your component. So, to use the `users` global in the example above, you could do the following

```javascript
import React from 'react';

export default class Main extends React.Component {
    static get globals() {
        return ['users'];
    }
    render() {
        return this.props.users.map((user, key) => {
            return <div key={key}>{user.name}</div>
        })
    }
}
```

Globals can be either an Array, for multiple globals, or a String for a single global.

### Routing

The api was intended to be kept as close to Adonis' original view API as possible, therefore the `view` property is added to the HTTPContext, and can be used as such

```javascript
const Route = use('Route');

Route.get('/', ({view}) => {
    return view.render('viewName');
})
```

It functions exactally the same as the default API in the sense that you are not supposed to pass the filename extension, and you can access views inside routes by doing `view.render('folder.viewName')`.

## Extras

### Configs

You can use a `react.js` config file in the `config` folder to alter some of the package's functionality.

These are the default configs

```javascript
{
    toStatic: false, 
    useCustomWrapper: false, 
    wrapperFile: 'wrapper', 
    title: 'Adonis React App',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
    <title>{{title}}</title>
</head>
<body>
    <div id="root">{{content}}</div>
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
</html>`
}
```

- toStatic

Changes the method used in the server-side rendering from `renderToString` to `renderToStaticMarkup`

- useCustomWrapper

Enables using a custom file as a wrapper component.
If true, this component will be rendered as a parent to the specified view component on every `view.render` call.

- wrapperFile

The name of the file that will be used as a wrapper, should useCustomWrapper be set to true. Defaults to `wrapper`. Don't forget to make your wrapper render it's children!

- title 

The page title to your application.

- template

The template on wich the server-side rendering will be done. You can change it to add your meta tags or set a static title on the page. It is not recommended to remove anything from the `body`, as all `script` tags are necessary for the rendering.

### Endpoint specific title

The `view` method on the `Route` exposes a `with` method that can currently only be used to change the title.

Please note that this will change the `title` config inside the singleton with every call, so it is recommended to have this in every route if you want to use it, or you can use `document.title = 'Your title'` inside of your components.

```javascript
const Route = use('Route');

Route.get('/', ({view}) => {
    return view.with({title: 'Different Title'}).render('viewName');
})
```

### Using CSS and static files

The package uses babel on runtime to parse the view and send the resulting code and view, and therefore does not have access to what would come from `webpack` loaders. So to make sure all `import`s point to the same place, the only loader aside from `babel-loader` used is `file-loader`, therefore doing `import styles from './style.css'` will result in `styles` containing the public path to the file.

With that in mind, in order to use external CSS files, you can do 

```javascript
import styles from './style.css';
.
.
.
render() {
    return <div>
    <link rel="stylesheet" href={styles}/>
    </div>
}
```

inside of your component to make sure all css loads both on the first (server-side) render, and on all subsequent ones.

However that should cause packages that require `style-loader` or `css-loader` to not work properly unless you manually `import` those stylesheets, and solutions to this are welcome.

`import`ing static files works without any issues as it returns the files's public path in relation to the server

