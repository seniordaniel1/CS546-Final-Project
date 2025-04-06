import postRoutes from './posts.js';
import userRoutes from './users.js';
import express from 'express';

import exphbs from 'express-handlebars';
const staticDir = express.static('public');

const handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === 'number')
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

            return new Handlebars.SafeString(JSON.stringify(obj));
        },

        partialsDir: ['views/partials/']
    }
});

const constructorMethod = (app) => {
    app.use(express.urlencoded({ extended: true }));
    app.use(staticDir);
    app.engine('handlebars', handlebarsInstance.engine);
    app.set('view engine', 'handlebars');
    app.use('/posts', postRoutes);
    app.use('/users', userRoutes);
    // app.use('/comments', commentRoutes)

    app.use('*', (req, res) => {
        return res.status(404).render('404', { title: "404 Error: Page Not found", message: "Page not found" })
    });
};


export default constructorMethod;