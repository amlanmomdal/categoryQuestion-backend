var express = require("express");
const {
  Register,
  login,
  getProfile,
  updateProfile,
  imageUpload,
} = require("../Controller/Auth/user");
const {
  create,
  viewAll,
  questionCreate,
  questionEachCategory,
  bulkQuestion,
} = require("../Controller/User/category");
var router = express.Router();
const middleware = require("../services/middleware").middleware;

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/register", Register);
router.post("/login", login);
router.post("/upload", imageUpload);

router.use(middleware);
router.get("/get-profile", getProfile);
router.put("/update-user", updateProfile);

// category page route
router.post("/category", create);
router.get("/category", viewAll);
router.post("/question", questionCreate);
router.get("/category-question/:categoryID", questionEachCategory);
router.post("/bulk-category", bulkQuestion)

module.exports = router;
