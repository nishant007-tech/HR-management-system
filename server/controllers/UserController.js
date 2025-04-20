const userModel = require("../models/userModel");
const client = require("../redis/setupRedis");
const bcrypt = require("bcrypt");
const path    = require("path");
const candidateModel = require("../models/candidateModel");

const createUser = async (req, res) => {
    let emailExist = await userModel.findOne({ email: req.body.email });
    if (emailExist) {
        return res.status(409).json({ message: 'Email is already exist...!' });
    }
    if (!req.body.password) {
        return res.status(400).json({ message: 'Password is required!' });
    }
    //bcrypt the password basically into hash format for security reasons
    const salt = await bcrypt.genSalt(10);
    const hassedPassword = await bcrypt.hash(req.body.password, salt);
    const user = new userModel({
        name: req.body.name,
        email: req.body.email,
        password: hassedPassword,
        role: req.body.role,
    });
    try {
        const savedUser = await user.save();
        // ProduceMsg(savedUser?.email);
        res.json({ savedUser: savedUser, msg: "Data Received" });
    } catch (err) {
        res.status(400).json(err);
    }
}

const getUserById = async (req, res) => {
    try {
        let user = await userModel.findOne({ _id: req.params.id }, { password: 0 })
        res.status(200).send(user);
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
}
const updateUserById = async (req, res) => {
    try {
        let existingUser = await userModel.findOne({ email:  req.body.email});
        if (existingUser?._id == req.params.id || !existingUser) {
            let updatedUser = await userModel.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true });
             res.json(updatedUser);
        } else {
             res.status(409).json({ message: "Email already exist!" })
        }
    } catch (error) {
        res.status(400).send({message:"Something went wrong!"})
    }
}

const deleteUserById = async (req, res) => {
    try {
        await userModel.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "User Deleted!" });
    } catch (error) {
        res.status(400).send(error)
    }
}

const deleteCandidateById = async (req, res) => {
    try {
        await candidateModel.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "User Deleted!" });
    } catch (error) {
        res.status(400).send(error)
    }
}

const searchUsers = async (req, res) => {
    console.log("hello");
    try {
        const {
            startDate = null,
            endDate = null,
            name = null,
            page = 1,
            limit = 6
        } = req.query;
        const skipIndex = (page - 1) * limit;
        let query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: startDate,
                $lte: new Date(endDate).toDateString() + " " + "24:00:00"
            }
        } if (name) {
            query.name = { $regex: name, $options: "i" };
        }
        let key = `User-${page}-` + JSON.stringify(query);
        let dataFromRedis = await client.get(key);
        console.log("dataFromRedis",dataFromRedis);
        if (dataFromRedis) {
            return res.json(JSON.parse(dataFromRedis));
        } else {
            console.log("query",query);
            console.log("limit",limit);
            console.log("skipIndex",skipIndex);
            let results = await fetchQueryResults(query, limit, skipIndex);
            client.setEx(key, 3600, JSON.stringify({ results: results, count: results.length }));
            console.log("results",results);
            res.json({ results: results, count: results.length  });
        }
    } catch (error) {
        res.status(400).send(error);
    }
}

const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 6 } = req.query;
        const skipIndex = (page - 1) * limit;
        let query = {};
        let count = await userModel.find({}, { password: 0 }).countDocuments();
        let results =  await userModel.find(query, { password: 0 })
        .sort({ _id: 1 })
        .skip(skipIndex)
        .limit(limit)
        .lean()
        .exec();
        res.status(200).json({ results: results, count: count });
    } catch (e) {
        res.status(500).json({ message: "Error Occured" });
    }
};

const getCandidates = async (req, res) => {
    try {
        const { 
            page = 1,
            limit = 6,
            status,
            position,
            search,
            startDate,
            endDate
        } = req.query;
        console.log("status",status);
        console.log("position",position);
        
        const filter = {};
      if (status)   filter.status   = status;
      if (position) filter.position = position;
      if (search)   filter.name     = new RegExp(search, 'i');
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate)   filter.createdAt.$lte = new Date(endDate);
      }
      const skip = (page - 1) * limit;
      const [ results, count ] = await Promise.all([
        candidateModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        candidateModel.countDocuments(filter)
      ]);
      console.log("results",results);
      
      return res.json({ results, count });
    } catch (e) {
        res.status(500).json({ message: "Error Occured" });
    }
};

const addCandidate = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Resume PDF is required" });
      }
  
      const { name, email, phone, position, experience, status } = req.body;
  
      if (!name || !email || !phone) {
        return res.status(400).json({ message: "Name, email & phone are required" });
      }
  
      // prevent duplicate email
      const exists = await candidateModel.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "Email already in use" });
      }
  
      // create the candidate record
      const candidate = new candidateModel({
        name,
        email,
        phone,
        position,
        experience: experience || 0,
        status:     status || "new",
        resumeUrl:  req.file.path    // store the local path, e.g. "uploads/resumes/resume-123456.pdf"
      });
  
      await candidate.save();
  
      res.status(201).json({
        candidate,
        message: "Candidate added successfully"
      });
  
    } catch (err) {
      console.error("Add candidate error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };


const downloadResume = async (req, res) => {
    try {
      const { id } = req.params;
      const candidate = await candidateModel.findById(id).select("resumeUrl");

      console.log("candidate.resumeUrl",candidate.resumeUrl);
      
      if (!candidate || !candidate.resumeUrl) {
        return res.status(404).json({ message: "Resume not found" });
      }
  
      // resolve the absolute path
      const filePath = path.resolve(candidate.resumeUrl);
  
      // send the file for download
      return res.download(filePath, err => {
        if (err) {
          console.error("Download error:", err);
          return res.status(500).json({ message: "Could not download file" });
        }
      });
    } catch (err) {
      console.error("DownloadResume error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };
  
  
  const updateStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const allowed = ['new','scheduled','ongoing','selected','rejected'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      const updated = await candidateModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ message: 'Candidate not found' });
      }
      res.json({ message: 'Status updated', candidate: updated });
    } catch (err) {
      console.error('updateStatus error', err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  const getCandidatesMetaData = async (req, res) => {
    try {
      const positions = await candidateModel.distinct('position');
      const statuses  = await candidateModel.distinct('status');
        console.log("positions",positions);
        console.log("statuses",statuses);
        
      return res.json({ positions, statuses });
    } catch (err) {
      console.error('getMeta error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  };


module.exports = {
    getUserById,
    getCandidatesMetaData,
    updateStatus,
    updateUserById,
    downloadResume,
    deleteUserById,
    deleteCandidateById,
    searchUsers,
    createUser,
    getUsers,
    getCandidates,
    addCandidate,
}