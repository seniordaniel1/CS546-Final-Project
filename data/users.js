import { users } from "../config/mongoCollections.js";
import { checkInputsExistence, checkNumArguments, isStr, validateAge, validateEmail, validateName, validateUsername, validateUserIdAndReturnTrimmedId } from "../helpers.js";
import bcrypt from "bcryptjs";
import { ObjectId } from 'mongodb';

const exportedMethods = {
    // TODO: Determine what arguments are needed to create a new user 
    // TODO: Populate function to add a user to User Collection 
    createUser: async (firstName, lastName, email, username, age, password) => {
        // Validate the number of inputs and ensure that each input exists
        const currArgs = [firstName, lastName, email, username, age, password];
        await checkNumArguments(currArgs, 6, 'createUser');
        await checkInputsExistence(currArgs);

        // Validate if firstName and lastName are valid names
        await validateName(firstName, "createUser-firstName");
        await validateName(lastName, "createUser-lastName");
        
        // Validate if email input is a valid email
        await validateEmail(email, 'createUser-emailAddress')
        
        // Validate if username are valid inputs
        await validateUsername(username, "createdUser-username")

        // Validate is age is a valid input
        await validateAge(age, "createUser-validateAge");
        
        // Hash the password
        const hashedPassword = await exportedMethods.hashPassword(password);
        
        // Set the following inputs to empty array:
            // * followers
            // * following
            // * posts
            // * comments
        const followers = [], following = [], posts = [], comments = [];

        // Create new user object 
        const newUser = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            username: username,
            age: age,
            password: password,
            followers: followers,
            following: following,
            posts: posts,
            comments: comments
        }

        // Add user to database
        const userCollection = await users();
        const insertInfo = await userCollection.insertOne(newUser);
        if (!insertInfo.acknowledged || !insertInfo.insertedId)
            throw new Error('Could not add user');
        
        // Get ID and return user by getUserById
        const newId = insertInfo.insertedId.toString();
        const currUser = await exportedMethods.getUserById(newId);
        return currUser;
    },
    
    // TODO: Populate function to get all users from User collection
    getAllUsers: async () => {
        const userCollection = await users();
        let userList = await userCollection.find({}).toArray();
        if (!userList) throw new Error('Could not get all users');
        userList = userList.map((element) => {
            element._id = element._id.toString();
            return element;
        });
        return userList;
    },
    
    // TODO: Populate function to get user by ID
    getUserById: async (userId) => {
        // Validate input 
        await checkInputsExistence([userId])
        await checkNumArguments([userId], 1, "getUserById");
        await isStr(userId, "getUserById-userIdStr");

        // Check that user ID is in database
        userId = await validateUserIdAndReturnTrimmedId(userId);

        // Get all users and find user by id 
        const userCollection = await users();
        const user = await userCollection.findOne({ _id: new ObjectId(userId) });

        // If user is not found, throw an error 
        if (user === null) throw new Error('No user with that id');

        // Convert user id to string and return user object
        user._id = user._id.toString();
        return user;
    },
    
    // TODO: Populate function to remove user by Id
    removeUser: async (userId) => {
    },
    
    // TODO: Determine what arguments are needed to update an existing user
    // TODO: Populate function to update user 
    updateUser: async () => {
    },
    
    // TODO: Convert password into hashed password and validate that password input is a string
    hashPassword: async (password) => {
        // Validate inputs 
        await checkNumArguments([password], 1, "hashPassword")
        await checkInputsExistence([password]);
        await isStr(password, "hashPassword");

        // Generate a salt
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);

        // Hash the password using the generated salt
        const hashedPassword = bcrypt.hashSync(password, salt);
        return hashedPassword;
    }
}

export default exportedMethods;