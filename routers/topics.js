const express = require('express');
const router = express.Router()
const User = require("../models/user")
const Posts = require("../models/topics")

router.get('/newPost' , (req,res) =>{
    res.render('newPost')
})

router.post("/newPost", (req,res)=>{
    const post={
        type: req.body.type ,
        title: req.body.title  ,
        content: req.body.content 
    }
     

Posts.create(post).then(newPost=>{
    console.log("new POST",newPost);
    User.findOneAndUpdate({_id:req.session.userId},{$push:{posts:newPost._id}}).then(user=>{
        res.redirect('/home')
        console.log("user post ",user);
    })
}).catch(err =>console.log(err))
  
});

//read more
router.get('/readMore', (req, res) => {
 const postUser =req.query.id
 const postId = req.query.postId
 const loggedUser = req.session.userId;
 console.log(postUser)
    User.findById(postUser)
    .populate("posts")
    .populate({
        path : "followings",
        populate: {
            path: "posts"
        }})
    .then(user => {
         res.render('readMore', { user,postId,author:postUser,loggedUser})
    }).catch(err => console.log(err));

})



module.exports = router