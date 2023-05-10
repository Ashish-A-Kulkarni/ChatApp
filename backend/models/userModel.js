const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
    {
        name: { type: String, require: true },
        email: { type: String, require: true ,unique: true},
        password: { type: String, require: true },
        pic: { type: String, require: true, default: "" },  //add the link to the default pic
    },
    {
        timestamp: true
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.pre('save', async function (next) {
    if (!this.isModified) {
        next();
    }
    const salt = await bcrypt.getSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(this.password);
});

const User = mongoose.model("User", userSchema);
module.exports = User;