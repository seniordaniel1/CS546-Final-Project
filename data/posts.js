import { posts, users } from "../config/mongoCollections.js";
import { checkInputsExistence, checkNumArguments, validateIdAndReturnTrimmedId, trimArguments, getTodayDate, isStr, updateUniqueElementInList } from "../helpers.js";
import { userData, commentData } from "./index.js";
import { ObjectId } from 'mongodb';

const exportedMethods = {
    createPost: async (userId, content, imageUrl=null) => {
        // Depending on if post has an image url, validate
        if (imageUrl === null) {
            const currArgs = [userId, content];
            await checkInputsExistence(currArgs);
            await checkNumArguments(currArgs, 2, "createPostNoImage");
        } else {
            const currArgs = [userId, content, imageUrl];
            await checkInputsExistence(currArgs);
            await checkNumArguments(currArgs, 3, "createPostWithImage");
            isStr(imageUrl, "createPost-imageUrl");
        }

        await isStr(userId, "createPost-userId");
        await isStr(content, "createPost-content");

        await userData.getUserById(userId);

        // Trim All arguments:
        userId = await validateIdAndReturnTrimmedId(userId);
        content = await trimArguments([content]);
        content = content[0];
        if (imageUrl) {
            imageUrl = await trimArguments([imageUrl]);
            imageUrl = imageUrl[0];
        }

        // Set timestamp to current time 
        const timestamp = await getTodayDate();

        // Set comments, likes, dislikes to empty array
        const comments = [], likes = [], dislikes = [];

        // Create a new post object 
        const newPost = {
            userId: userId,
            content: content,
            imageUrl: imageUrl,
            timestamp: timestamp,
            comments: comments,
            likes: likes,
            dislikes: dislikes
        }

        // Add post to collection
        const postCollection = await posts();
        const insertInfo = await postCollection.insertOne(newPost);
        if (!insertInfo.acknowledged || !insertInfo.insertedId)
            throw new Error('Could not add post');
        
        // Get ID and return user by getUserById
        const newId = insertInfo.insertedId.toString();
        const currPost = await exportedMethods.getPostById(newId);

        // Add postId to userId.posts array
        const userCollection = await users();
        const updatedInfo = updateUniqueElementInList(userCollection, userId, 'add', 'posts', newId, 'createPost');
        // Validate that function was executed
        if (!updatedInfo)
            throw new Error('could not update movie successfully');

        return currPost;

    },
    getAllPosts: async () => {
        const postCollection = await posts();
        let postList = await postCollection.find({}).toArray();
        if (!postList) throw new Error('Could not get all users');
        postList = postList.map((element) => {
            element._id = element._id.toString();
            return element;
        });
        return postList;
    },
    getPostsByUserId: async (userId) => {
        // Validate arguments
        await checkInputsExistence([userId])
        await checkNumArguments([userId], 1, "getPostsByUserId");
        await isStr(userId, "getPostsByUserId-userIdStr");

        // Get posts by user id 
        const currUser = await userData.getUserById(userId);
        const currUserPosts = currUser.posts;
        const ans = []
        for (let i = 0; i < currUserPosts.length; i++) {
            const currPost = currUserPosts[i];
            ans.push(await exportedMethods.getPostById(currPost));
        }
        return ans;
    },
    removePost: async (postId) => {
        // Validate inputs 
        await checkInputsExistence([postId])
        await checkNumArguments([postId], 1, "removePostrById");
        await isStr(postId, "removePostById-postIdStr");
        postId = await validateIdAndReturnTrimmedId(postId);

        // Get post by Id
        const currPost = await exportedMethods.getPostById(postId);

        // Delete all comments connected to post 
        await commentData.removeCommentsByPostId(currPost._id);

        // Delete post from post database
        const postCollection = await posts();
        const deletionInfo = await postCollection.findOneAndDelete({
            _id: new ObjectId(currPost._id)
        });
        
        // Validate that deletion was successful
        if (!deletionInfo) {
            throw new Error(`Could not delete post with id of ${postId}`);
        }

        // Delete post from User database
        const userCollection = await users();
        await updateUniqueElementInList(userCollection, deletionInfo.userId, "remove", "posts", postId, "removePost");

        return { ...currPost, deleted: true };
    },
    getPostById: async (postId) => {
        // Validate input 
        await checkInputsExistence([postId])
        await checkNumArguments([postId], 1, "getPostById");
        await isStr(postId, "getPostById-postIdStr");

        // Check that post ID is in database
        postId = await validateIdAndReturnTrimmedId(postId);

        // Get all posts and find post by id 
        const postCollection = await posts();
        const post = await postCollection.findOne({ _id: new ObjectId(postId) });

        // If post is not found, throw an error 
        if (post === null) throw new Error('No post with that id');

        // Convert post id to string and return post object
        post._id = post._id.toString();
        return post;
    },
    removePostsByUserId: async (userId) => {
        // Validate arguments
        await checkInputsExistence([userId])
        await checkNumArguments([userId], 1, "removePostsByUserId");
        await isStr(userId, "removePostsByUserId-userIdStr");
        await userData.getUserById(userId);

        // Remove all posts made by a user 
        const posts = await exportedMethods.getPostsByUserId(userId);
        for (const post of posts) {
            await exportedMethods.removePost(post._id);
        }
    },
    addLike: async (postId, userID) => {
        // Validate inputs 
        const currArgs = [postId, userID];
        await checkInputsExistence(currArgs);
        await checkNumArguments(currArgs, 2, "addLike");
        userID = await validateIdAndReturnTrimmedId(userID);
        postId = await validateIdAndReturnTrimmedId(postId);
        await exportedMethods.getPostById(postId);
        await userData.getUserById(userID);

        // Add userId to posts.likes array 
        const postCollection = await posts();
        const updatedInfo = await updateUniqueElementInList(postCollection, postId, 'add', 'likes', userID, 'addLike');

        if (!updatedInfo)
            throw new Error("Could not add like to post")
        
        // Return object with ID as string 
        updatedInfo._id = updatedInfo._id.toString();
        return updatedInfo;        
    },
    addDislike: async (postId, userID) => {
        // Validate inputs 
        const currArgs = [postId, userID];
        await checkInputsExistence(currArgs);
        await checkNumArguments(currArgs, 2, "addDislike");
        userID = await validateIdAndReturnTrimmedId(userID);
        postId = await validateIdAndReturnTrimmedId(postId);
        await exportedMethods.getPostById(postId);
        await userData.getUserById(userID);

        // Add userId to posts.likes array 
        const postCollection = await posts();
        const updatedInfo = await updateUniqueElementInList(postCollection, postId, 'add', 'dislikes', userID, 'addDislike');
        
        if (!updatedInfo)
            throw new Error("Could not add like to post")

        // Return object with ID as string 
        updatedInfo._id = updatedInfo._id.toString();
        return updatedInfo; 
    },
    removeLike: async (postId, userID) => {
        // Validate Arguments
        const currArgs = [postId, userID];
        await checkInputsExistence(currArgs);
        await checkNumArguments(currArgs, 2, "removeLike");
        userID = await validateIdAndReturnTrimmedId(userID);
        postId = await validateIdAndReturnTrimmedId(postId);
        await exportedMethods.getPostById(postId);
        await userData.getUserById(userID);

        // Remove userId from posts.likes 
        const postCollection = await posts();
        const updatedInfo = await postCollection.findOneAndUpdate(
            { _id: new ObjectId(postId) },
            { $pull: { likes: userID } },
            { returnDocument: 'after' }
        )
        if (!updatedInfo)
            throw new Error("Could not add like to post")

        // Return object with ID as string 
        updatedInfo._id = updatedInfo._id.toString();
        return updatedInfo;  
    },
    removeDislike: async (postId, userID) => {
        // Validate Arguments
        const currArgs = [postId, userID];
        await checkInputsExistence(currArgs);
        await checkNumArguments(currArgs, 2, "removeDisike");
        userID = await validateIdAndReturnTrimmedId(userID);
        postId = await validateIdAndReturnTrimmedId(postId);
        await exportedMethods.getPostById(postId);
        await userData.getUserById(userID);

        // Remove userId from posts.likes 
        const postCollection = await posts();
        const updatedInfo = await postCollection.findOneAndUpdate(
            { _id: new ObjectId(postId) },
            { $pull: { dislikes: userID } },
            { returnDocument: 'after' }
        )
        if (!updatedInfo)
            throw new Error("Could not add like to post")

        // Return object with ID as string 
        updatedInfo._id = updatedInfo._id.toString();
        return updatedInfo;
    },
}

export default exportedMethods;