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

// TODO: Modify the collection name to users -- please refer to lab4
import { movies } from "./config/mongoCollections.js";
import { dbConnection, closeConnection } from "./config/mongoConnection.js";
// TODO: Create relevant file for CRUD operations: Needs to connect to MongoDB database as done in Lab4
// import { createMovie, getAllMovies, getMovieById, removeMovie, renameMovie } from "./data/movies.js";
import express from 'express';
// TODO: Update Routes 
import configRoutesFunction from './routes/index.js';

async function main() {
    const app = express();
    configRoutesFunction(app);

    // Reset database everytime this is run
    const db = await dbConnection();
    await db.dropDatabase();

    app.listen(3000, () => {
        console.log("We've now got a server!");
        console.log('Your routes will be running on http://localhost:3000');
    });

    // // Close Connection to DB
    // await closeConnection();
}

main();