import express from 'express';
import postRoutes from './posts.js';
import exphbs from 'express-handlebars';
import session from 'express-session';
import passport from 'passport';
import flash from 'connect-flash';
import { userData } from '../data/index.js';
import "../config/passport-config.js";

import userRoutes from "./users.js";

const app = express();
const staticDir = express.static('public');

const handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === 'number')
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
            return new Handlebars.SafeString(JSON.stringify(obj));
        },
        partialsDir: ['views/partials/']
    }
});

const ensureAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

const constructorMethod = (app) => {
    app.use(express.urlencoded({ extended: true }));
    app.use(staticDir);
    app.engine('handlebars', handlebarsInstance.engine);
    app.set('view engine', 'handlebars');


    app.use(session({ secret: 'some_random_key', resave: false, saveUninitialized: true }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    // Public routes -- Render home, login, and register pages
    app.get('/', (req, res) => {

        const user = req.session.user || null;
        res.render('home', { title: 'Home', user: user });
    });

    app.get('/login', (req, res) => {
        res.render('login', { title: 'Login', error: req.flash('error') });
    });

    app.get('/register', (req, res) => {
        res.render('register', { title: 'Register', error: req.flash('error') });
    });

    app.get('/create-post', ensureAuthenticated, (req, res) => {
        res.render('createPost', { title: 'Create Post' });
    });


    // Protected routes
    app.use('/posts', postRoutes);
    app.use('/users', userRoutes);

    // Handle 404 errors
    app.use('*', (req, res) => {
        return res.status(404).render('404', { title: "404 Error: Page Not found", message: "Page not found" });
    });
};

export default constructorMethod;
