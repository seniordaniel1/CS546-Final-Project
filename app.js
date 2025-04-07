import { dbConnection, closeConnection } from "./config/mongoConnection.js";
import { userData, postData, commentData } from "./data/index.js";
import express from 'express';
import configRoutesFunction from './routes/index.js';


const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

async function usersTest() {
    // Create 2 users
    const user1 = await testCase(userData.createUser, "Tony", "Stark", "tstark@stark.com", "tonystark", 44, "IronMan101")
    const user2 = await testCase(userData.createUser, "Bruce", "Wayne", "brucewayne@wayne.com", "brucewayne", 52, "BruceTheMan")
    const getAllUsers = await userData.getAllUsers()
}

async function deleteUserTest() {
    // Create a post by an existing user
    const user1 = await testCase(userData.createUser, "Tony", "Stark", "tstark@stark.com", "tonystark", 44, "IronMan101")
    const post1 = await testCase(postData.createPost, user1._id, "I am Iron Man!")
    const post2 = await testCase(postData.createPost, user1._id, "I've created an infinite source of energy!!")

    const user2 = await testCase(userData.createUser, "Bruce", "Wayne", "brucewayne@wayne.com", "brucewayne", 52, "BruceTheMan")
    const post3 = await testCase(postData.createPost, user2._id, "I am not the Batman!");
    const post4 = await testCase(postData.createPost, user2._id, "Hello, world!");

    postData.addLike(post2._id, user2._id);

    const comment1 = await testCase(commentData.createComment,post1._id, user2._id, "We all knew this!");
    const comment2 = await testCase(commentData.createComment,post1._id, user1._id, "Who would have thought!");
    console.log("All users before user deletion:\n", await userData.getAllUsers());
    console.log("All posts before user deletion:\n", await postData.getAllPosts());
    console.log("All Comments before user deletion:\n",await commentData.getAllComments());

    await testCase(userData.removeUser, user2._id);
    console.log("All users after user deletion:\n", await userData.getAllUsers());
    console.log("All posts after user deletion:\n", await postData.getAllPosts());
    console.log("All comments after user deletion:\n",await commentData.getAllComments());
}

async function deletePostTest(){
    // Create a post by an existing user
    const user1 = await testCase(userData.createUser, "Tony", "Stark", "tstark@stark.com", "tonystark", 44, "IronMan101")
    const post1 = await testCase(postData.createPost, user1._id, "I am Iron Man!")
    const post2 = await testCase(postData.createPost, user1._id, "I've created an infinite source of energy!!")

    const user2 = await testCase(userData.createUser, "Bruce", "Wayne", "brucewayne@wayne.com", "brucewayne", 52, "BruceTheMan")
    const post3 = await testCase(postData.createPost, user2._id, "I am not the Batman!");
    const post4 = await testCase(postData.createPost, user2._id, "Hello, world!");

    const comment1 = await testCase(commentData.createComment,post1._id, user2._id, "We all knew this!");
    const comment2 = await testCase(commentData.createComment,post1._id, user1._id, "Who would have thought!");
    
    // console.log("All users before user deletion:\n", await userData.getAllUsers());
    // console.log("All posts before user deletion:\n", await postData.getAllPosts());
    // console.log("All Comments before user deletion:\n",await commentData.getAllComments());

    // await testCase(postData.removePost, post1._id);
    // console.log("All users after user deletion:\n", await userData.getAllUsers());
    // console.log("All posts after user deletion:\n", await postData.getAllPosts());
    // console.log("All comments after user deletion:\n",await commentData.getAllComments());
}

async function deleteCommentTest() {
    const user1 = await testCase(userData.createUser, "Tony", "Stark", "tstark@stark.com", "tonystark", 44, "IronMan101")
    const post1 = await testCase(postData.createPost, user1._id, "I am Iron Man!")
    
    const comment1 = await testCase(commentData.createComment, post1._id, user1._id, "I've joined the Avengers!");
    console.log("Get Comment by ID: ", comment1);
    console.log("Before deleting comment")
    console.log("Get all Users: ", await userData.getAllUsers());
    console.log("Get all Posts: ", await postData.getAllPosts());
    console.log("Get all Comments: ", await commentData.getAllComments());

    await testCase(commentData.removeComment, comment1._id);
    console.log("After deleting comment")
    console.log("Get all users: ", await userData.getAllUsers());
    console.log("Get all Posts: ", await postData.getAllPosts());
    console.log("Get all comments: ", await commentData.getAllComments());
}

async function followersTest(){
    // Create 2 users 
    const user1 = await testCase(userData.createUser, "Tony", "Stark", "tstark@stark.com", "tonystark", 44, "IronMan101")
    const user2 = await testCase(userData.createUser, "Bruce", "Wayne", "brucewayne@wayne.com", "brucewayne", 52, "BruceTheMan")

    // Make it such that user1 follows user2 
    await testCase(userData.addFollower, user1._id, user2._id);

    // console.log("Before deleting a user:\n")
    // // console.log("Before deleting a follower:\n")
    // console.log(await userData.getAllUsers())

    // // await testCase(userData.removeFollower, user1._id, user2._id);
    // await testCase(userData.removeUser, user2._id);
    // console.log("After deleting a user:\n")
    // // console.log("After deleting a Follower:\n")
    // console.log(await userData.getAllUsers())
}

async function likeTest() {
    const user1 = await testCase(userData.createUser, "Tony", "Stark", "tstark@stark.com", "tonystark", 44, "IronMan101")
    const post1 = await testCase(postData.createPost, user1._id, "I am Iron Man!")
    const post2 = await testCase(postData.createPost, user1._id, "I've created an infinite source of energy!!")

    const user2 = await testCase(userData.createUser, "Bruce", "Wayne", "brucewayne@wayne.com", "brucewayne", 52, "BruceTheMan")
    const post3 = await testCase(postData.createPost, user2._id, "I am not the Batman!");
    const post4 = await testCase(postData.createPost, user2._id, "Hello, world!");

    await postData.addLike(post1._id, user1._id);
    await postData.addDislike(post1._id, user2._id);

    // Before removal
    console.log("Before removal:")
    console.log(await postData.getAllPosts());

    // After removal
    await postData.removeLike(post1._id, user1._id);
    await postData.removeDislike(post1._id, user2._id);

    console.log("After removal:")
    console.log(await postData.getAllPosts());
}

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

// Connect to the database and reset it before starting the server
async function startServer() {
    try {
        const db = await dbConnection();
        await db.dropDatabase(); // Reset the database

        // Configure routes after the database is ready
        configRoutesFunction(app);

        // Start the server
        app.listen(3000, () => {
            console.log("We've now got a server!");
            console.log('Your routes will be running on http://localhost:3000');
        });

        // await deletePostTest();
        // await followersTest();
        await comprehensiveTest();

    } catch (error) {
        console.error('Error starting the server:', error);
    }
}

// Call the function to start the server
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