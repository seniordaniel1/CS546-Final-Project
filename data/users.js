import { users } from "../config/mongoCollections.js";
import { checkInputsExistence, checkNumArguments, isStr, validateAge, validateEmail, validateName, validateUsername, validateIdAndReturnTrimmedId, trimArguments, validateListUserIds } from "../helpers.js";
import bcrypt from "bcryptjs";
import { ObjectId } from 'mongodb';
import { postData } from "./index.js";

const exportedMethods = {
    createUser: async (firstName, lastName, email, username, age, password) => {
        // Validate the number of inputs and ensure that each input exists
        const currArgs = [firstName, lastName, email, username, age, password];
        await checkNumArguments(currArgs, 6, 'createUser');
        await checkInputsExistence(currArgs);

        // Trim all non-array and non-id arguments 
        const trimmedArgs = await trimArguments(currArgs);
        firstName = trimmedArgs[0];
        lastName = trimmedArgs[1];
        email = trimmedArgs[2];
        username = trimmedArgs[3];
        age = trimmedArgs[4];
        password = trimmedArgs[5]

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
    getUserById: async (userId) => {
        // Validate input 
        await checkInputsExistence([userId])
        await checkNumArguments([userId], 1, "getUserById");
        await isStr(userId, "getUserById-userIdStr");

        // Check that user ID is in database
        userId = await validateIdAndReturnTrimmedId(userId);

        // Get all users and find user by id 
        const userCollection = await users();
        const user = await userCollection.findOne({ _id: new ObjectId(userId) });

        // If user is not found, throw an error 
        if (user === null) throw new Error('No user with that id');

        // Convert user id to string and return user object
        user._id = user._id.toString();
        return user;
    },
    removeUser: async (userId) => {
        await checkInputsExistence([userId])
        await checkNumArguments([userId], 1, "removeUserById");
        await isStr(userId, "removeUserById-userIdStr");
        await validateIdAndReturnTrimmedId(userId);

        const currMovie = await exportedMethods.getUserById(userId);
        
        // Delete all posts that the user created
        await postData.removePostsByUserId(userId);

        // TODO: Delete all comments that the user created


        // Delete user from user collections
        const userCollection = await users();
        const deletionInfo = await userCollection.findOneAndDelete({
            _id: new ObjectId(userId)
        });

        if (!deletionInfo) {
            throw new Error(`Could not delete movie with id of ${userId}`);
        }

        return { ...currMovie, deleted: true };
    },
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
    },
    addPostToUser: async (userId, postId) => {
        // Authenticate inputs
        const currArgs = [userId, postId];
        await checkInputsExistence(currArgs);
        await checkNumArguments(currArgs, 2, "addPostToUser");
        userId = await validateIdAndReturnTrimmedId(userId);
        postId = await validateIdAndReturnTrimmedId(postId);
        await isStr(userId, "addPostToUser-userId");
        await isStr(postId, "addPostToUser-postId")

        // Add post to user
        const userCollection = await users();
        const updatedInfo = await userCollection.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $push: { posts: postId } },
            { returnDocument: 'after' }
        )

        // Validate that function was executed
        if (!updatedInfo)
            throw new Error('could not update movie successfully');
        
        updatedInfo._id = updatedInfo._id.toString();
        return updatedInfo;
    },
    addCommentToUser: async(userId, commentId) => {
        // Authenticate inputs
        const currArgs = [userId, commentId];
        await checkInputsExistence(currArgs);
        await checkNumArguments(currArgs, 2, "addCommentToUser");
        userId = await validateIdAndReturnTrimmedId(userId);
        commentId = await validateIdAndReturnTrimmedId(commentId);
        await isStr(userId, "addCommentToUser-userId");
        await isStr(commentId, "addCommentToUser-commentId")

        // Add post to user
        const userCollection = await users();
        const updatedInfo = await userCollection.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $push: { comments: commentId } },
            { returnDocument: 'after' }
        )

        // Validate that function was executed
        if (!updatedInfo)
            throw new Error('could not update movie successfully');
        
        updatedInfo._id = updatedInfo._id.toString();
        return updatedInfo;
    }
}

export default exportedMethods;