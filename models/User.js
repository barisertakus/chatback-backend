const mongoose = require("mongoose");

const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Can't be blank"],
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "Can't be blank"],
      index: true,
      validate: [isEmail, "Invalid Email!"],
    },

    password: {
      type: String,
      required: [true, "Can't be blank"],
    },
    picture: {
      type: String,
    },
    newMessages: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      default: "online",
    },
  },
  { minimize: false }
);

UserSchema.pre("save", function(next) {
  const user = this;
  if(!user.isModified("password")) return next();

  bcrypt.genSalt(10, (error, salt)=> {
    if(error) return error;
    
    bcrypt.hash(user.password, salt, (error,hash)=>{
      if(error) return next(error);

      user.password = hash;
      next();
    })
  })
})

UserSchema.methods.toJSON = () => {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
}

UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email!");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password!");
  return user;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
