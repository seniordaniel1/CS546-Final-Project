import { userData, postData, commentData } from '../data/index.js';
import { getUserJsonsFromUserIds } from '../helpers.js';
import express from 'express';
const router = express.Router();

// * Logout 
router.get("/logout", async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).render('error', { error: 'Error logging out' });
            }
            return res.redirect('/');
        });
    } catch (error) {
        return res.status(500).render('error', { error: 'Error logging out' });
    }
});

// API Route to add a follower
router.post('/:id/addFollower', async (req, res) => {
    try {
        // Get viwed user & logged-in user
        const userId = req.params.id;
        const userIdFollower = req.user._id;

        // Add follower 
        await userData.addFollower(userIdFollower, userId);

        // Get updated followers count
        const updatedUser = await userData.getUserById(userId)
        res.json({ newFollowersCount: updatedUser.followers.length });
    } catch (error) {
        console.log("Error", error)
        res.status(500).send(error.message);
    }
});

// API Route to remove follower
router.post('/:id/removeFollower', async (req, res) => {
    try {
        // Get viwed user & logged-in user
        const userId = req.params.id;
        const userIdFollower = req.user._id;

        // Remove follower 
        await userData.removeFollower(userIdFollower, userId);

        // Get updated followers count
        const updatedUser = await userData.getUserById(userId)
        res.json({ newFollowersCount: updatedUser.followers.length });
    } catch (error) {
        console.log("Error", error)
        res.status(500).send(error.message);
    }
});

// * Get user by ID
router.get("/:id", async (req, res) => {
    try {
        // Validating that input is a valid user 
        const user = await userData.getUserById(req.params.id);

        // Get all posts that user has made
        const posts = await postData.getPostsByUserId(user._id);
        // Get all comments that user has made 
        const comments = await commentData.getCommentsByUserId(user._id);

        // Get the logged-in user's ID
        const loggedInUserId = req.user._id

        // Check if the logged-in user is following the user
        const isFollowing = loggedInUserId && user.followers.includes(loggedInUserId);

        // Check that user isnt looking at their own profile
        const isSelf = loggedInUserId && loggedInUserId.toString() === user._id.toString();

        return res.render('getUserById', {
            user: user,
            title: `${user._id}`,
            posts: posts,
            comments: comments,
            isFollowing: isFollowing,
            isSelf: isSelf
        });
    } catch (e) {
        return res.status(404).render('error', { title: "404 Error: User Not found", message: "User not found" });
    }
});

// * Get all users
router.get("/", async (req, res) => {
    try {
        const users = await userData.getAllUsers();
        return res.render('getAllUsers', {
            title: "All users",
            users: users
        })
    } catch (e) {
        // Something went wrong with the server!
        return res.status(400).render('error', { title: "400 Error: Something went wrong", message: `${e}` })
    }
});

// * Create a post 
router.post('/createPost', async (req, res) => {
    try {
        const user = req.user;
        const { content, imageUrl } = req.body;

        if (!content) {
            return res.status(500).json({ "Error": "Invalid inputs" });
        }
        const createdPost = await postData.createPost(user._id, content, imageUrl); 
        res.json(createdPost); 
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send('Internal Server Error');
    }
});

// * Create a comment 
router.post('/createComment', async(req, res) => {
    try {
        const user = req.user;
        const { content, postId } = req.body;
        if (!content) {
            return res.status(500).json({"Error": "Invalid inputs"});
        }
        const newComment = await commentData.createComment(postId, user._id, content);
        newComment['user'] = user;
        return res.json(newComment);
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// * Add a like 
router.post('/addLike', async (req, res) => {
    try {
        // Grab postId & user details
        const { postId } = req.body;
        const user = req.user;
        const userId = user._id;
        const post = await postData.getPostById(postId);

        // Get all users who liked and disliked the post 
        const userPostLikes = post.likes || [];
        const userPostDislikes = post.dislikes || [];

        // If user has already liked the post, change nothing with +0 change to likeScore
        if (userPostLikes.includes(userId)) {
            const ans = {
                post: { ...post, likes: userPostLikes, dislikes: userPostDislikes },
                user: user,
                alreadyLiked: true,
                alreadyDisliked: false,
                likeScore: userPostLikes.length - userPostDislikes.length,
                likes: userPostLikes,
                dislikes: userPostDislikes
            };
            return res.json(ans);
        }

        // If user has disliked, you need to remove the dislike and then add the like with +2 change to likeScore
        else if (userPostDislikes.includes(userId)) {
            await postData.removeDislike(postId, userId);
            await postData.addLike(postId, userId);

            const updatedLikes = [...userPostLikes, userId];
            const updatedDislikes = userPostDislikes.filter(id => id !== userId);

            const ans = {
                post: { ...post, likes: updatedLikes, dislikes: updatedDislikes },
                user: user,
                alreadyLiked: false,
                alreadyDisliked: true,
                likeScore: updatedLikes.length - updatedDislikes.length,
                likes: updatedLikes,
                dislikes: updatedDislikes
            };
            return res.json(ans);
        }

        // If user has neither liked nor disliked the post, you only need to add the like with +1 change to likeScore
        else {
            await postData.addLike(postId, userId);

            const updatedLikes = [...userPostLikes, userId];

            const ans = {
                post: { ...post, likes: updatedLikes, dislikes: userPostDislikes },
                user: user,
                alreadyLiked: false,
                alreadyDisliked: false,
                likeScore: updatedLikes.length - userPostDislikes.length,
                likes: updatedLikes,
            };
            return res.json(ans);
        }
    } catch (error) {
        console.error('Error in addLike:', error);
        res.status(500).send(error.message);
    }
});

// * Add a dislike 
router.post('/addDislike', async (req, res) => {
    try {
        // Grab postId & user details
        const { postId } = req.body;
        const user = req.user;
        const userId = user._id;
        const post = await postData.getPostById(postId);

        // Get all users who liked and disliked the post 
        const userPostLikes = post.likes || [];
        const userPostDislikes = post.dislikes || [];

        // If user has neither liked nor disliked the post 
        if (!userPostLikes.includes(userId) && !userPostDislikes.includes(userId)) {
            const updatedDislikes = [...userPostDislikes, userId];
            const updatedLikes = userPostLikes.filter(id => id !== userId);
            const ans = {
                post: { ...post, likes: updatedLikes, dislikes: updatedDislikes },
                user: user,
                alreadyLiked: false,
                alreadyDisliked: false,
                likeScore: updatedLikes.length - updatedDislikes.length,
                likes: updatedLikes,
                dislikes: updatedDislikes
            };
            return res.json(ans);
        }

        // If user has liked the most, remove the like and add the dislike
        else if (userPostLikes.includes(userId)) {
            await postData.removeLike(postId, userId); 
            await postData.addDislike(postId, userId);

            const updatedDislikes = [...userPostDislikes, userId];
            const updatedLikes = userPostLikes.filter(id => id !== userId);

            const ans = {
                post: { ...post, likes: updatedLikes, dislikes: updatedDislikes },
                user: user,
                alreadyLiked: true,
                alreadyDisliked: false,
                likeScore: updatedLikes.length - updatedDislikes.length,
                likes: updatedLikes,
                dislikes: updatedDislikes
            };
            return res.json(ans);
        }

        // If user has already disliked the post, do nothing
        else if (userPostDislikes.includes(userId)) {
            const ans = {
                post: { ...post, likes: userPostLikes, dislikes: userPostDislikes },
                user: user,
                alreadyLiked: false,
                alreadyDisliked: true,
                likeScore: likeScore,
                likes: userPostLikes,
                dislikes: userPostDislikes
            };
            return res.json(ans);
        }
    } catch (error) {
        console.error('Error in removeLike:', error);
        res.status(500).send(error.message);
    }
});


// * Print all followers by userId
router.get("/:id/followers", async (req, res) => {
    try {
        const user = await userData.getUserById(req.params.id);
        const userFollowerList = user.followers
        const followers = await getUserJsonsFromUserIds(userFollowerList, "getUserFollowers");
        return res.render('getUserFollow', { user: user, list: followers, listType: "Followers", title: `${user.username}'s Followers` });
    } catch (error) {
        return res.status(500).render('error', { title: "500 Error: Something went wrong", message: `${error}` });
    }
})

// * Print all following by userId
router.get("/:id/following", async (req, res) => {
    try {
        const user = await userData.getUserById(req.params.id);
        const userFollowingList = user.following
        const following = await getUserJsonsFromUserIds(userFollowingList, "getUserFollowing");
        return res.render('getUserFollow', { user: user, list: following, listType: "Following", title: `${user.username} Following List` });
    } catch (error) {
        return res.status(500).render('error', { title: "500 Error: Something went wrong", message: `${error}` });
    }
})

export default router

// // * Delete an existing user 
// router.delete("/:id", async (req, res) => {
//     try {
//         // Make sure that user exists
//         await userData.getUserById(req.params.id);
        
//         // Get user Id  
//         const userId = req.params.id;  
//         const user = await userData.removeUser(userId);
//         return res.json({...user, deleted: true });
//     } catch (error) {
//         // If user doesnt exist, throw 404 error 
//         if (error.message === "No user with that id") {
//             return res.status(404).json({ message: "User not found!" }); 
//         }
//         return res.status(400).json({ Error: `${error.message}` });
//     }
// });

// // * Add a follower 
// router.post("/follow", async (req, res) => {
//     try {
//         // upd = userPostData
//         const upd = req.body;
//         const follower = upd.follower
//         const following = upd.following;

//         // Validate input data -- Must do it here or it will throw an error otherwise
//         if (!follower || !following) {
//             return res.status(400).json({ error: "All fields are required." });
//         }

//         // Validate that the user exists 
//         await userData.getUserById(follower); 
//         await userData.getUserById(following);

//         // Add to the respective follower and following list
//         const result = await userData.addFollower(upd.following, upd.follower);
//         return res.json(result);
//     } catch (error) {
//         // If user doesnt exist, throw 404 error 
//         if (error.message === "No user with that id") {
//             return res.status(404).json({ message: "User not found!" });
//         }
//         return res.status(400).json({ Error: `${error.message}` });
//     }
// })

// // * Remove a follower
// router.delete("/follow", async (req, res) => {
//     try {
//         // upd = userPostData
//         const upd = req.body;
//         const follower = upd.follower
//         const following = upd.following;

//         // Validate input data -- Must do it here or it will throw an error otherwise
//         if (!follower || !following) {
//             return res.status(400).json({ error: "All fields are required." });
//         }

//         // Validate that the user exists 
//         await userData.getUserById(follower);
//         await userData.getUserById(following);

//         // Add to the respective follower and following list
//         const result = await userData.removeFollower(upd.following, upd.follower);
//         return res.json({...result, removedFollower: true});
//     } catch (error) {
//         // If user doesnt exist, throw 404 error 
//         if (error.message === "No user with that id") {
//             return res.status(404).json({ message: "User not found!" });
//         }
//         return res.status(400).json({ Error: `${error.message}` });
//     }
// })