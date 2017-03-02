//Include Mongoose and other required modules
var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

//Define the user Schema
var userSchema = mongoose.Schema({
    username : {
      type : String,
      required : true
    },
    password : {
      type : String
    }

});

userSchema.plugin(passportLocalMongoose);

//Compile the users Schema model
mongoose.model('Users', userSchema);
