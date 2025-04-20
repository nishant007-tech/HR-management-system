const router = require("express").Router();
const auth = require("../middleware/auth_middleware");
const AuthController = require("../controllers/authController");
const UserController = require("../controllers/UserController");
const EmployeeController = require("../controllers/EmployeeController");

const multer  = require("multer");
const path    = require("path");

// configure multer to save PDFs into /uploads/resumes
const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes/");
  },
  filename: (req, file, cb) => {
    // e.g. resume-1617901234567.pdf
    const ext = path.extname(file.originalname);
    cb(null, `resume-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files are allowed"), false);
    } else {
      cb(null, true);
    }
  },
});


//api to create new user
router.post("/create_user", UserController.createUser);
//login api for admin
router.post("/login", AuthController.Login);
//register api for admin
router.post("/register", AuthController.Register);
//filter users by date range (when user is created)
router.get("/users/search", auth, UserController.searchUsers)
//api to get user by id
router.get("/users/:id", auth, UserController.getUserById)
//api to get users according to pagination or page limit
router.get("/users", auth, UserController.getUsers);

router.get("/candidates", auth, UserController.getCandidates);
router.post("/add_candidate", upload.single("resume"), UserController.addCandidate);
router.delete('/candidates/:id', auth, UserController.deleteCandidateById);
router.get("/candidates/:id/resume", UserController.downloadResume);
router.patch('/candidates/:id/status', UserController.updateStatus);
router.get('/candidates/metadata', UserController.getCandidatesMetaData);

//update user by Id api
router.patch("/users/:id", auth, UserController.updateUserById);
//delete user by Id api
router.delete('/users/:id', auth, UserController.deleteUserById);


router.get(
  '/employees/metadata',
  auth,
  EmployeeController.getMetadata
);

router.get(
  '/employees',
  auth,
  EmployeeController.getEmployees
);

router.get(
  '/employees/:id',
  auth,
  EmployeeController.getEmployee
);

router.post(
  '/employees/',
  auth,
  EmployeeController.createEmployee
);

router.put(
  '/employees/:id',
  auth,
  EmployeeController.updateEmployee
);

router.patch(
  '/employees/:id/status',
  auth,
  EmployeeController.updateEmployeeStatus
);

router.delete(
  '/employees/:id',
  auth,
  EmployeeController.deleteEmployee
);



module.exports = router;