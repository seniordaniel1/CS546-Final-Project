import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { userData } from '../data/index.js';

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        // Get user by username
        let user;
        try {
            user = await userData.getUserByUsername(username);
        } catch (error) {
            user = null
        }

        // Check if user exists
        if (!user) {
            return done(null, false, { message: 'Invalid user' });
        }

        // Validate if password exists
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Invalid User' });
        }

        return done(null, user);
    } catch (error) {
        return done(null, false, { message: 'An error occurred during authentication. Please try again.' });
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.username);
});

passport.deserializeUser(async (username, done) => {
    const user = await userData.getUserByUsername(username);
    done(null, user);
});
