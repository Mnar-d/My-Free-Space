const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    passwordDigest: {
        type: String,
        required: true,
    },
    name:String,
    email: String,
    image: String,
    contact: String,
    twitter:String,
    facebook: String,
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Posts'}], 
     // (posts.type) "select" and "type of topic" in home page  & (posts.title)"topic title" in home page & (posts.contain )"read more" in home page ||| {type , titile ,contain}
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    followings: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    // favorits: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    })
UserSchema.statics.createSecure = (username,name,password,email,image,contact,twitter,facebook, callback)=>{
    console.log("I received this email, password :")
    bcrypt.genSalt((req, salt) => {
        console.log("bcrypt salt:", salt);
        bcrypt.hash(password, salt, (err, passwordHash) => {
            console.log("password:", password);
            console.log("passwordHash:", passwordHash);
            //if (username == username ){update}else{create}
            User.create({username,name, passwordDigest: passwordHash, email,image, contact, twitter, facebook },callback)
        })
    })
}

UserSchema.statics.authenticate = (username, password, callback) => {
    User.findOne({username})
    .then((foundUser)=>{
        // console.log("user")
        if (!foundUser) {
            callback("No user found", null);
          } else if (foundUser.checkPassword(password)) {
            callback(null, foundUser);
          } else {
            callback("Wrong password", null);
          }
          console.log("Authenticate foundUser: ", foundUser);
    }).catch((err)=> console.log(err));
};

UserSchema.methods.checkPassword = function(password){
   return bcrypt.compareSync(password, this.passwordDigest)    
}

var User = mongoose.model("User", UserSchema)
module.exports = User;
