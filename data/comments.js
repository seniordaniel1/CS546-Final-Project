import { comments, users, posts } from "../config/mongoCollections.js";
import { checkInputsExistence, checkNumArguments, isStr, trimArguments, validateIdAndReturnTrimmedId, getTodayDate } from "../helpers.js";
import { userData, postData } from "./index.js";
import { ObjectId } from 'mongodb';

const exportedMethods = {
    createComment: async (postId, userId, text) => {
        // Validate arguments
        const currArgs = [postId, userId, text];
        // checks that inputs exist
        await checkInputsExistence(currArgs); 
        // check correct number of inputs
        await checkNumArguments(currArgs, 3, "createComment");
        // check that inputs are strings 
        await isStr(postId, "createComment-postId"); 
        await isStr(userId, "createCommetn-userId");
        await isStr(text, "createComment-text");
        // Checks that both ID inputs are valid
        await postData.getPostById(postId);
        await userData.getUserById(userId);

        // Trim the arguments
        const trimmedArgs = await trimArguments(currArgs);
        postId = trimmedArgs[0];
        userId = await validateIdAndReturnTrimmedId(userId);
        text = trimmedArgs[2];

        // Set timestamp to current time 
        const timestamp = await getTodayDate();

        const newComment = {
            postId: postId,
            userId: userId,
            text: text,
            timestamp: timestamp
        }

        // Add comment to collection
        const commentCollection = await comments();
        const insertInfo = await commentCollection.insertOne(newComment);
        if (!insertInfo.acknowledged || !insertInfo.insertedId)
            throw new Error('Could not add post');

        const commentId = insertInfo.insertedId.toString();
        const currComment = exportedMethods.getCommentById(commentId);

        // Add commentId to user.comments array
        await userData.addCommentToUser(userId, commentId);
        // Add commentId to post.comments array
        await postData.addCommentToPost(postId, commentId);
        
        return currComment;

    },
    getAllComments: async () => {
        const commentCollection = await comments();
        let commentList = await commentCollection.find({}).toArray();
        if (!commentList) throw new Error('Could not get all users');
        commentList = commentList.map((element) => {
            element._id = element._id.toString();
            return element;
        });
        return commentList;
    },
    getCommentById: async (commentId) => {
        // Validate input 
        await checkInputsExistence([commentId])
        await checkNumArguments([commentId], 1, "getCommentById");
        await isStr(commentId, "getCommentById-commentIdStr");

        // Check that comment ID is in database
        commentId = await validateIdAndReturnTrimmedId(commentId);

        // Get all comments and find comment by id 
        const commentCollection = await comments();
        const comment = await commentCollection.findOne({ _id: new ObjectId(commentId) });

        // If comment is not found, throw an error 
        if (comment === null) throw new Error('No comment with that id');

        // Convert comment id to string and return comment object
        comment._id = comment._id.toString();
        return comment;
    },
    removeComment: async (commentId) => {
        // Validate inputs 
        await checkInputsExistence([commentId])
        await checkNumArguments([commentId], 1, "removeCommentById");
        await isStr(commentId, "removeCommentById-commentIdStr");
        commentId = await validateIdAndReturnTrimmedId(commentId);

        // Get comment by Id
        const currPost = await exportedMethods.getCommentById(commentId);

        // Delete post from post database
        const commentCollection = await comments();
        const deletionInfo = await commentCollection.findOneAndDelete({
            _id: new ObjectId(currPost._id)
        });
        
        // Validate that deletion was successful
        if (!deletionInfo) {
            throw new Error(`Could not delete movie with id of ${postId}`);
        }

        // Delete comment from User database
        const userCollection = await users();
        await userCollection.updateOne(
            { _id: new ObjectId(deletionInfo.userId) }, 
            { $pull: { comments: commentId } } 
        );

        // Delete comment from Post database
        const postCollection = await posts();
        await postCollection.updateOne(
            { _id: new ObjectId(deletionInfo.postId) }, 
            { $pull: { comments: commentId } } 
        )

        return { ...currPost, deleted: true };
    },
    getCommentsByUserId: async (userId) => {
        // Validate arguments
        await checkInputsExistence([userId])
        await checkNumArguments([userId], 1, "getCommentsByUserId");
        await isStr(userId, "getCommentsByUserId-userIdStr");

        // Get posts by user id 
        const currUser = await userData.getUserById(userId);
        const currUserComments = currUser.comments;
        const ans = []
        for (let i = 0; i < currUserComments.length; i++) {
            const currComment = currUserComments[i];
            ans.push(await exportedMethods.getCommentById(currComment));
        }
        return ans;
    },
    removeCommentsByUserId: async (userId) => {
        // Validate arguments
        await checkInputsExistence([userId])
        await checkNumArguments([userId], 1, "removeCommentsByUserId");
        await isStr(userId, "removeCommentsByUserId-userIdStr");
        await userData.getUserById(userId);

        // Remove all comments made by a user 
        const comments = await exportedMethods.getCommentsByUserId(userId);
        for (const comment of comments) {
            await exportedMethods.removeComment(comment._id);
        }
    },
    getCommentsByPostId: async (postId) => {
        // Validate inputs 
        await checkInputsExistence([postId])
        await checkNumArguments([postId], 1, "getCommentsByPostId");
        await isStr(postId, "getCommentsByPostId-postIdStr");
        postId = await validateIdAndReturnTrimmedId(postId);

        // Get posts by user id 
        const currPost = await postData.getPostById(postId);
        const currPostComments = currPost.comments;
        const ans = []
        for (let i = 0; i < currPostComments.length; i++) {
            const currComment = currPostComments[i];
            ans.push(await exportedMethods.getCommentById(currComment));
        }
        return ans;
    },
    removeCommentsByPostId: async (postId) => {
        // Validate arguments
        await checkInputsExistence([postId])
        await checkNumArguments([postId], 1, "removeCommentsByPostId");
        await isStr(postId, "removeCommentsByPostId-postIdStr");
        postId = await validateIdAndReturnTrimmedId(postId);
        await postData.getPostById(postId);

        // Remove all comments made by a user 
        const comments = await exportedMethods.getCommentsByPostId(postId);
        for (const comment of comments) {
            await exportedMethods.removeComment(comment._id);
        }
    }
}

export default exportedMethods;