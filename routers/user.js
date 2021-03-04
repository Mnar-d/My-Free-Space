const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Posts = require("../models/topics");
const { render } = require('ejs');
const bcrypt = require('bcrypt')

//show publications
router.get("/publications", (req, res) => {
    User.findById(req.session.userId)
        .populate('posts')
        .then(user => {
            res.render("publications", { user })
        })
        .catch(err => console.log(err));
});

//signup
router.get('/signup', (req, res) => {
    res.render("signup")
})

//signup(create new)
router.post('/users', (req, res) => {
    User.findOne({ email: req.body.email })
        //if (image==null) return default image , HOW and WERE ?
        .then(user => {
            if (user) {
                return res.send("email has been used")
            }
            User.createSecure(
                req.body.username,
                req.body.name,
                req.body.password,
                req.body.email,
                req.body.image,
                req.body.contact,
                req.body.twitter,
                req.body.facebook,
                (err, newUser) => {
                    console.log("newUser: ", newUser);
                    req.session.userId = newUser._id;
                    //user to be used in profile page
                    user = newUser
                    res.redirect('/profile')
                })
        })
})

//login
router.get("/login", function (req, res) {
    res.render("login");
});

//login (sessions)
router.post('/sessions', (req, res) => {
    console.log("login")
    User.authenticate(req.body.username,
        req.body.password, (err, loogedinUser) => {
            if (err) {
                console.log("Authentication error: ", err);
                res.status(500).send(err);
            } else {
                req.session.userId = loogedinUser._id;
                res.redirect("/home");
            }
        })
})

// the view of home page 
router.get('/home', (req, res) => {
    User.findById(req.session.userId)
        .populate('followers')
        .populate('followings')
        .populate('posts')
        .populate({
            path: "followings",
            populate: {
                path: "posts"
            }
        })
        .then(user => {
            res.render('home', { user })
        }).catch(err => console.log(err));


})

//profile
router.get("/profile", (req, res) => {
    console.log("session", req.session.userId)
    User.findOne({ _id: req.session.userId })
        .populate('followers')
        .populate("followings")
        .populate("posts")
        .then((loogedin) => {
            res.render("profile", { user: loogedin })
        }).catch((err) => console.log("Error: User not found ", err))
})


// router.get("/profile", (req, res) => {
//     User.find()
//         .then((allPosts) => {
//             res.render("profile", { posts: allPosts });
//         })
//         .catch((err) => console.log(err));
// })

//user profile

router.get('/userProfile', (req, res) => {
    User.findOne({ _id: req.session.userId })
        .populate('followers')
        .populate("followings")
        .populate("posts")
        .then((users) => {
            res.render("userProfile", { user: users })
        }).catch((err) => console.log("Error: User not found ", err))
})
//follow

//edit
router.get("/edit", (req, res) => {
    // const user = req.session.userId;// -> id :huda -> {user,name ,...}
    // console.log(" user check edit ", user.email)
    // res.render("edit", { user })

    User.findById(req.session.userId)
        .populate('followers')
        .populate("followings")
        .populate("posts")
        .then(user => {
            res.render('edit', { user })
        }).catch(err => console.log(err));
})

router.put("/edit", (req, res) => {

    const userId = req.session.userId;
    const password = req.body.oldPassword;
    const edituser = {
        name: req.body.name,
        email: req.body.email,
        image: req.body.image,
        contact: req.body.contact,
        twitter: req.body.twitter,
        facebook: req.body.facebook,
    }

    // const {password, email, img, contact, twitter, facebook} = req.body
    User.findById(userId).then(user => {

        if (user.checkPassword(password)) {
            // console.log("edituser", edituser)
            if (req.body.password == '') {
                User.findByIdAndUpdate(userId, edituser, { useFindAndModify: true })
                    .then((user) => {
                        console.log(user)
                        res.redirect(`/profile`)
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            } else {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(req.body.password, salt);
                edituser.passwordDigest = hash
                User.findByIdAndUpdate(userId, edituser)
                    .then((user) => {
                        res.redirect(`/profile`)
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            }

        } else {
            console.log("entered password wrong can't change password");
            res.redirect('/profile')
        }
    })


})

//followers
router.get('/followers', (req, res) => {
    User.findById(req.session.userId)
        .populate('followers')
        .populate("followings")
        .populate("posts")
        .then(user => {
            res.render('followers', { user })
        }).catch(err => console.log(err));
})


//following
router.get('/following', (req, res) => {
    User.findById(req.session.userId)
        .populate('followers')
        .populate("followings")
        .populate("posts")
        .then(user => {
            res.render('followings', { user })
        }).catch(err => console.log(err));
})
//follow
router.post('/user/follow/:idToFollow', (req, res) => {
    const idToFollow = req.params.idToFollow;
    User.findByIdAndUpdate(req.session.userId, { $addToSet: { followings: idToFollow } })
        .then(user => {
            User.findByIdAndUpdate(idToFollow, { $addToSet: { followers: req.session.userId } })
                .then(user => {
                }).catch(err => console.log(err))
            res.redirect('/following')
        }).catch(err => console.log(err))
})

//oterProfile
router.get("/otherProfile", (req, res) => {
    const id = req.query.id;
    User.findById(id)
        .populate('followers')
        .populate("followings")
        .populate("posts")
        .then(user => {
            res.render('otherProfile', { user, id })
        }).catch(err => console.log(err));
});

//edit Post
router.get("/editPost", (req, res) => {
    const userId = req.session.userId;
    const postId = req.query.postId;
    User.findById(userId)
        .populate("posts")
        .then(user => {
            console.log("user",user)
            res.render('editPost', { user ,postId})
        }).catch(err => console.log(err));
})

router.put("/editPost", (req, res) => {

    const userId = req.session.userId;
    const postId = req.query.postId;
    const editposts = {
        type: req.body.type,
        title: req.body.title,
        content: req.body.content,
    }

    User.findByIdAndUpdate(postId, editposts, { useFindAndModify: true })
        .then((user) => {
            console.log(user)
            res.redirect(`/profile`)
        })
        .catch((err) => {
            console.log(err)
        })


})



//favorits
router.get('/favorits', (req, res) => {

    User.findById(req.session.userId)
        .populate("favorits")
        .then(user => {
            res.render('home', { user })
        }).catch(err => console.log(err));
})

router.post('/user/favorite/:favoriteId', (req, res) => {
    const favoriteId = req.params.fId;
    User.findByIdAndUpdate(req.session.userId, { $push: { favorits: favoriteId } })
        .then(user => {

            res.redirect('/home')

        }).catch(err => console.log(err));
})


//logout
router.get("/logout", (req, res) => {
    req.session.userId = null;
    res.redirect("/");
});

module.exports = router

