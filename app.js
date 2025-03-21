// TODO: Modify the collection name to users -- please refer to lab4
import { dbConnection, closeConnection } from "./config/mongoConnection.js";
// TODO: Create relevant file for CRUD operations: Needs to connect to MongoDB database as done in Lab4
import { userData } from "./data/index.js";
import express from 'express';

// TODO: Update Routes 
import configRoutesFunction from './routes/index.js';


const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

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

        await testCase(userData.createUser, "Tony", "Stark", "tstarkstark.com", "tonystark", 44, "IronMan101")
        await testCase(userData.createUser, "Bruce", "Wayne", "brucewayne@wayne.com", "brucewayne", 52, "BruceTheMan")
        console.log(await userData.getAllUsers())
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