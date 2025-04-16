import { dbConnection, closeConnection } from "./config/mongoConnection.js";
import { userData, postData, commentData } from "./data/index.js";
import express from 'express';
import configRoutesFunction from './routes/index.js';
import Session from "express-session";


const app = express();
app.use(express.json());

app.use(Session({
    name: "MiniBlog",
    secret: "SecretVal23",
    resave: false,
    cookie:
    {
        maxAge: 60000,
    },

}));


app.use('/login', (req, res, next) => {
    if (req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
});

app.use('/register', (req, res, next) => {
    if (req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
});

app.use('/logout', (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
});

app.use('/create-post', (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
});


async function comprehensiveTest() {
    // Create users
    const user1 = await testCase(userData.createUser, "Tony", "Stark", "tstark@stark.com", "tonystark", 44, "IronMan101");
    const user2 = await testCase(userData.createUser, "Bruce", "Wayne", "brucewayne@wayne.com", "brucewayne", 52, "BruceTheMan");
    const user3 = await testCase(userData.createUser, "Clark", "Kent", "clarkkent@dailyplanet.com", "clarkkent", 35, "Superman123");
    const user4 = await testCase(userData.createUser, "Diana", "Prince", "dianaprince@themyscira.com", "dianaprince", 30, "WonderWoman456");

    // Create posts for user1
    const post1 = await testCase(postData.createPost, user1._id, "I am Iron Man!");
    const post2 = await testCase(postData.createPost, user1._id, "I've created an infinite source of energy!!");

    // Create posts for user2
    const post3 = await testCase(postData.createPost, user2._id, "I am not the Batman!");
    const post4 = await testCase(postData.createPost, user2._id, "Hello, world!");

    // Create posts for user3
    const post5 = await testCase(postData.createPost, user3._id, "I can fly!");
    const post6 = await testCase(postData.createPost, user3._id, "Truth, Justice, and the American Way!");

    // Create posts for user4
    const post7 = await testCase(postData.createPost, user4._id, "I am the goddess of war!");
    const post8 = await testCase(postData.createPost, user4._id, "For Themyscira!");

    // Create comments
    const comment1 = await testCase(commentData.createComment, post1._id, user2._id, "We all knew this!");
    const comment2 = await testCase(commentData.createComment, post1._id, user3._id, "Who would have thought!");
    const comment3 = await testCase(commentData.createComment, post3._id, user1._id, "You are the Batman!");
    const comment4 = await testCase(commentData.createComment, post5._id, user4._id, "That's amazing!");
    const comment5 = await testCase(commentData.createComment, post7._id, user1._id, "You inspire me!");

    // Add likes
    await postData.addLike(post1._id, user1._id);
    await postData.addLike(post2._id, user2._id);
    await postData.addLike(post3._id, user3._id);
    await postData.addLike(post4._id, user4._id);
    await postData.addDislike(post1._id, user2._id);
    await postData.addDislike(post3._id, user1._id);

    // Follow relationships
    await testCase(userData.addFollower, user1._id, user2._id);
    await testCase(userData.addFollower, user1._id, user3._id);
    await testCase(userData.addFollower, user2._id, user4._id);
    await testCase(userData.addFollower, user3._id, user1._id);
    await testCase(userData.addFollower, user4._id, user2._id);
}


async function startServer() {
    try {
        // Connect to the database and reset it before starting the server
        const db = await dbConnection();
        //await db.dropDatabase(); // Uncomment this line to reset the database

        app.use(express.static("public"));
        configRoutesFunction(app);

        app.listen(3000, () => {
            console.log("We've now got a server!");
            console.log('Your routes will be running on http://localhost:3000');
        });

        await comprehensiveTest();

    } catch (error) {
        console.error('Error starting the server:', error);
    }
}
startServer();



/**
 * In a try-catch block, console.log whats returned from the function. If it throws an error, console.log the error. 
 * This stops the need to create multiple try-catch blocks to check for errors when running a function 
 * @param {Function} func Function input
 * @param  {...any} args Arguments for function input 
 * @reference https://stackoverflow.com/questions/13286233/pass-a-javascript-function-as-parameter
 * @usecase 1st parameter = function name, 2nd parameter onwards = parameters for said function
 *      let movie1 = await testCase(createMovie, "The Shawshank Redemption", " The film tells the story of banker Andy Dufresne, who is sentenced to life in Shawshank State Penitentiary", ['Thriller', 'Mystery'], 'R', "Castle Rock Entertainment", " Frank Darabont", ["Morgan Freeman", "Tim Robbins"], "11/14/1994", "2h 22min")
 */

async function testCase(func, ...args) {
    try {
        return await func(...args);
    } catch (error) {
        console.log(error)
    }
}