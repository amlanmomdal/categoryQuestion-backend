const mongoose = require("mongoose");
const { Validator } = require("node-input-validator");
const ResponseCode = require("../../services/responseCode");
const jwt = require("jsonwebtoken");
const { InputError } = require("../../services/errorHandeler");
const user = require("../../Model/user");
const passwordHash = require("password-hash");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB file size limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

function checkFileType(file, cb) {
  
  const filetypes = /jpeg|jpg|png|gif/;  
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());  
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images only!");
  }
}

function createToken(data) {
  return jwt.sign(data, "DonateSmile");
}

const getTokenData = async (token) => {
  let userData = await user.findOne({ token: token }).exec();
  console.log("userData", userData);
  return userData;
};

const Register = async (req, res) => {
  const v = new Validator(req.body, {
    email: "required|email",
    password: "required|minLength:8",
  });

  let matched = await v.check().then((val) => val);
  if (!matched) {
    return res
      .status(200)
      .send({ status: false, error: v.errors, message: InputError(v.errors) });
  }

  let SuperadminData = {
    ...req.body,
    password: passwordHash.generate(req.body.password),
    token: createToken(req.body),
    createdOn: new Date(),
  };

  const admin = new user(SuperadminData);
  return admin
    .save()
    .then((data) => {
      return res.status(ResponseCode.errorCode.success).json({
        status: true,
        message: "New Admin created successfully",
        data,
      });
    })
    .catch((error) => {
      const errors = DBerror(error);
      res.status(ResponseCode.errorCode.serverError).json({
        status: false,
        message: errors,
      });
    });
};

const login = async (req, res) => {
  const v = new Validator(req.body, {
    email: "required",
    password: "required|minLength:8",
  });
  let matched = await v.check().then((val) => val);
  if (!matched) {
    return res
      .status(ResponseCode.errorCode.dataNotmatch)
      .send({ status: false, error: v.errors });
  }

  user
    .findOne({ email: req.body.email })
    .then((data) => {
      if (!data) {
        res.status(ResponseCode.errorCode.dataNotmatch).json({
          status: false,
          message: "Wrong Email ID !",
        });
      } else {
        if (data != null && data.comparePassword(req.body.password)) {
          res.status(ResponseCode.errorCode.success).json({
            status: true,
            message: "Login successfully !",
            token: data.token,
          });
        } else {
          res.status(ResponseCode.errorCode.dataNotmatch).json({
            status: false,
            message: "Wrong Password !",
          });
        }
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(ResponseCode.errorCode.serverError).json({
        status: false,
        message: "Server error ! Data not found !",
      });
    });
};

const getProfile = async (req, res) => {
  user
    .aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $project: {
          isDeleted: 0,
          createdOn: 0,
          updatedOn: 0,
          password: 0,
          __v: 0,
        },
      },
    ])
    .then((data) => {
      res.status(ResponseCode.errorCode.success).json({
        status: true,
        message: "Data get successfully !",
        data: data[0],
      });
    })
    .catch((err) => {
      res.status(ResponseCode.errorCode.serverError).json({
        status: false,
        message: "Server error ! Data not found !",
      });
    });
};

const updateProfile = async (req, res) => {
  var updateObject = {};
  if (req.body.password) {
    updateObject = {
      ...req.body,
      password: passwordHash.generate(req.body.password),
      updatedOn: new Date(),
    };
  } else {
    updateObject = {
      ...req.body,
      updatedOn: new Date(),
    };
  }

  user
    .findOneAndUpdate(
      { _id: { $in: [new mongoose.Types.ObjectId(req.user._id)] } },
      updateObject
    )
    .then((data) => {
      if (!data) {
        return res.status(ResponseCode.errorCode.serverError).json({
          status: false,
          message: "User ID not match !",
        });
      } else {
        data = { ...data._doc, ...req.body };
        return res.status(ResponseCode.errorCode.success).json({
          status: true,
          message: "User Updated",
          data,
        });
      }
    })
    .catch((error) => {
      return res.status(ResponseCode.errorCode.serverError).json({
        status: false,
        message: "Server error. Please try again.",
      });
    });
};

const imageUpload = async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).send(err);
    } else {
      if (req.file == undefined) {
        return res.status(ResponseCode.errorCode.serverError).json({
          status: false,
          message: "Server error. Please try again.",
        });
      } else {
        const imageFile = req.file.path;
        return res.status(ResponseCode.errorCode.success).json({
          status: true,
          url: imageFile,
        });
      }
    }
  });
};

module.exports = {
  Register,
  getTokenData,
  login,
  getProfile,
  updateProfile,
  imageUpload,
};
