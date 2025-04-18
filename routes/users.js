import { userData, postData, commentData } from '../data/index.js';
import { getUserJsonsFromUserIds } from '../helpers.js';
import express from 'express';
const router = express.Router();

// // * Page to create a new user 
// router.get('/new', async (req, res) => {
//     try {
//         return res.render('newUser', { title: "New User" })
//     } catch (error) {
//         return res.render("400 Error: User creation failed", {message: `Error: ${error}`})
//     }
// })

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
        return res.status(404).render('404', { title: "404 Error: User Not found", message: "User not found" })
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


router.post("/login", async (req, res) => {

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const user = await userData.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password." });
        }


        const isPasswordValid = await userData.checkPassword(password, user.password);
        if (!isPasswordValid) {
            console.log("Invalid password");
            return res.status(401).json({ error: "Invalid username or password." });
        }

        req.session.user = {
            id: user._id.toString(),
        }; // Store user in session

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ error: `Login failed: ${error}` });
    }
});

router.post("/create", async (req, res) => {
    try {
        const { firstName, lastName, email, username, age, password } = req.body;

        if (!firstName || !lastName || !email || !username || !age || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        let existingUser;
        let existingEmail;
        try {
            existingUser = await userData.getUserByUsername(username);
        } catch (error) {
            existingUser = null
        }
        if (existingUser) {
            throw (new Error('Error creating user: Username already in use'));
        }

        try { existingEmail = await userData.getUserByEmail(lowercaseEmail); }
        catch (error) { existingEmail = null }
        if (existingEmail) {
            throw (new Error('Error creating user: Email already in use'));
        }


        const lowercaseEmail = email.toLowerCase();


        const newUser = {
            firstName: firstName,
            lastName: lastName,
            email: lowercaseEmail,
            username: username,
            age: age,
            password: password,
            followers: [],
            following: [],
            posts: [],
            comments: []
        }

        const createdUser = await userData.createUser(newUser.firstName, newUser.lastName, newUser.email, newUser.username, newUser.age, newUser.password);

        return res.status(201).json(createdUser);
    } catch (error) {
        return res.status(500).json({ error: `User cannot be created: ${error}` });
    }
});

router.post("/logout", async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: "Error logging out" });
            }
            return res.status(200).json({ message: "Logged out successfully" });
        });
    } catch (error) {
        return res.status(500).json({ error: `Logout failed: ${error}` });
    }
});




// // * Create a new user 
// router.post("/new", async (req, res) => {
//     try {
//         // upd = userPostData
//         const upd = req.body;

//         // Validate input data -- Must do it here as it will throw an error otherwise
//         if (!upd.firstName || !upd.lastName || !upd.email || !upd.age || !upd.password) {
//             return res.status(400).json({ error: "All fields are required." });
//         }

//         const newUser = await userData.createUser(upd.firstName, upd.lastName, upd.email, upd.email, upd.age, upd.password);
//         return res.json(newUser);
//     } catch (error) {
//         return res.status(400).json({ error: `User cannot be created: ${error}` });
//     }
// });

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
