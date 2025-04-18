import express from 'express';
import postRoutes from './posts.js';
import userRoutes from './users.js';
import exphbs from 'express-handlebars';
// https://github.com/jwalton/passport-api-docs?tab=readme-ov-file#passportsessionoptions
import passport from 'passport';
import session from 'express-session';
// https://peeyushjss.medium.com/guide-to-send-flash-messages-using-nodejs-b4f83d4b0bd7
import flash from 'connect-flash'; 
import { userData, postData } from '../data/index.js';
import "../config/passport-config.js";
// https://www.npmjs.com/package/express-xss-sanitizer
// https://blog.devops.dev/secure-your-nodejs-applications-with-express-xss-sanitizer-prevent-xss-attacks-effortlessly-e0f3d8a967fc
import { xss } from 'express-xss-sanitizer';
import bodyParser from 'body-parser';

const app = express();
const staticDir = express.static('public');

app.use(bodyParser.json({limit:'1kb'}));
app.use(bodyParser.urlencoded({extended: true, limit:'1kb'}));
app.use(xss());

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
    app.get('/', async (req, res) => {
        const posts = await postData.getAllPosts();
        // https://stackoverflow.com/questions/7555025/fastest-way-to-sort-an-array-by-timestamp
        
        // Sort posts by most recent
        posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        console.log(posts);
        res.render('home', { title: 'Home', posts: posts });
    });

    app.get('/login', (req, res) => {
        res.render('login', { title: 'Login', error: req.flash('error') });
    });

    app.get('/register', (req, res) => {
        res.render('register', { title: 'Register', error: req.flash('error') });
    });

    app.post('/register', async (req, res) => {
        const { firstName, lastName, email, username, age, password } = req.body;

        // Validate input
        if (!firstName || !lastName || !email || !username || !age || !password) {
            req.flash('error', 'Inputs invalid');
            return res.redirect('/register');
        }

        // Email needs to be case-insensitive
        const lowercaseEmail = email.toLowerCase();

        // Check if username & email already in use 
        try {
            let existingUser;
            let existingEmail;
            try {
                existingUser = await userData.getUserByUsername(username);
            } catch (error) {
                existingUser = null
            }
            if (existingUser) {
                req.flash('error', 'Error creating user: Username already in use');
                return res.redirect('/register');
            }

            try { existingEmail = await userData.getUserByEmail(lowercaseEmail); }
            catch (error) { existingEmail = null }
            if (existingEmail) {
                req.flash('error', 'Error creating user: Email already in use');
                return res.redirect('/register');
            }
        } catch (error) {
            req.flash('error', 'Error creating user: ' + error.message);
            return res.redirect('/register');
        }

        // Create the new user
        try {
            await userData.createUser(firstName, lastName, lowercaseEmail, username, age, password);
            res.redirect('/login');
        } catch (error) {
            req.flash('error', 'Error creating user: ' + error.message);
            return res.redirect('/register');
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

    app.get('/about', (req, res) => {
        res.render('about');
    })

    app.get('/contact', (req, res) => {
        res.render('contact');
    })

    // Protected routes
    app.use('/posts', ensureAuthenticated, postRoutes);
    app.use('/users', ensureAuthenticated, userRoutes);
    
    // ? For demo purposes only
    app.use('/profile', ensureAuthenticated, (req, res) => {
        const user = req.user;
        return res.json(user);
    })

    // Handle 404 errors
    app.use('*', (req, res) => {
        return res.status(404).render('404', { title: "404 Error: Page Not found", message: "Page not found" });
    });
};

export default constructorMethod;
