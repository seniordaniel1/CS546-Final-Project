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

// * Get user by ID
router.get("/:id", async (req, res) => {
    try {
        // Validating that input is a valid user 
        const user = await userData.getUserById(req.params.id);
        
        // Get all posts that user has made
        const posts = await postData.getPostsByUserId(user._id);
        // Get all comments that user has made 
        const comments = await commentData.getCommentsByUserId(user._id);
        return res.render('getUserById', { user: user, title: `${user._id}`, posts: posts, comments: comments });
    } catch (e) {
        return res.status(404).render('error', { title: "404 Error: User Not found", message: "User not found" })
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
        return res.status(400).send();
    }
});

router.post('/createPost', async (req, res) => {
    const user = req.user; 
    const { content, imageUrl } = req.body;

    if (!content) {
        return res.status(500).render('error', { title: "500 Error", message: "Unable to create new post" });
    }

    try {
        const createdPost = await postData.createPost(user._id, content, imageUrl); 
        res.json(createdPost); 
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send('Internal Server Error');
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
        return res.json(error);
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
        return res.json(error);
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