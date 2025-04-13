import express from 'express';
import postRoutes from './posts.js';
import exphbs from 'express-handlebars';
import session from 'express-session';
import passport from 'passport';
import flash from 'connect-flash'; 
import { userData } from '../data/index.js';
import "../config/passport-config.js";

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
    if (req.isAuthenticated()) {
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
        res.render('home', { title: 'Home' });
    });

    app.get('/login', (req, res) => {
        res.render('login', { title: 'Login', error: req.flash('error') });
    });

    app.get('/register', (req, res) => {
        res.render('register', { title: 'Register' });
    });

    app.post('/register', async (req, res) => {
        const { firstName, lastName, email, username, age, password } = req.body;

        // Validate input
        if (!firstName || !lastName || !email || !username || !age || !password) {
            return res.status(400).render('400', { error: 'Inputs invalid' });
        }

        // Check if username & email already in use 
        try {
            const existingUser = await userData.getUserByUsername(username);
            if (existingUser) {
                return res.status(400).render('register', { error: 'Username already in use' });
            }
            const existingEmail = await userData.getUserByEmail(email);
            if (existingEmail) {
                return res.status(400).render('register', { error: 'Email already in use' });
            }
        } catch (error) { }

        // Create the new user
        try {
            await userData.createUser(firstName, lastName, email, username, age, password);
            res.redirect('/login');
        } catch (error) {
            return res.status(500).render('register', { error: 'Error creating user: ' + error.message });
        }
    });

    app.post('/login', (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err); 
            }
            if (!user) {
                req.flash('error', 'Invalid username or password.');
                return res.redirect('/login'); 
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err); 
                }
                return res.redirect('/users');
            });
        })(req, res, next);
    });



    app.get('/logout', (req, res) => {
        req.logout((err) => {
            if (err) {
                return res.status(500).render('error', { error: 'Error logging out' });
            }
            res.redirect('/');
        });
    });

    // Protected routes
    app.use('/posts', ensureAuthenticated, postRoutes);

    // Handle 404 errors
    app.use('*', (req, res) => {
        return res.status(404).render('404', { title: "404 Error: Page Not found", message: "Page not found" });
    });
};

export default constructorMethod;
