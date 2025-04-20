const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Login = async (req, res) => {
    const { email, password } = req.body;
    let user = await userModel.findOne({ email: email });
    if (!user) {
        return res.status(400).json({ message: 'Email or Password is Wrong' });
    }
    if (user?.status == "active") {
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(400).json({ message: 'Invalid Password or Email' });
        }
        const token = jwt.sign({ id: user._id }, process.env.SECRET_JWT);
        res.json({ token: token, user: { _id: user._id, name: user.name, email: user.email }, message: "Login Successful" });
    } else {
        res.status(401).json({ message: "Not Authorized!" })
    }
}

const Register = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      console.log("req.body",req.body);
      
  
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required" });
      }
  
      const existing = await userModel.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
  
      const salt     = await bcrypt.genSalt(10);
      const hashedPw = await bcrypt.hash(password, salt);
  
      const user = new userModel({
        name,
        email,
        password: hashedPw,
      });
      await user.save();
  
      const token = jwt.sign({ id: user._id }, process.env.SECRET_JWT, {
        expiresIn: "7d"   // optional: set an expiry
      });
  
      res.status(201).json({
        token,
        user: {
          _id:   user._id,
          name:  user.name,
          email: user.email,
        },
        message: "Registration successful"
      });
  
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  


module.exports = {
    Login,
    Register,
};