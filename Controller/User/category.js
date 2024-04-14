const mongoose = require("mongoose");
const { Validator } = require("node-input-validator");
const categoryModel = require("../../Model/category");
const questionModel = require("../../Model/question");
const { InputError, DBerror } = require("../../services/errorHandeler");
const ResponseCode = require("../../services/responseCode");
const csv = require("csv-parser");
const fs = require("fs");
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
  limits: { fileSize: 10000000 }, // 10MB file size limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("csv");

function checkFileType(file, cb) {
  const filetypes = /csv/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: csv only!");
  }
}
const create = async (req, res) => {
  const v = new Validator(req.body, {
    name: "required",
  });
  let matched = await v.check().then((val) => val);
  if (!matched) {
    return res
      .status(ResponseCode.errorCode.dataNotmatch)
      .send({ status: false, error: v.errors, message: InputError(v.errors) });
  }

  let categoryData = {
    ...req.body,
  };
  const category = new categoryModel(categoryData);
  return category
    .save()
    .then((data) => {
      return res.status(ResponseCode.errorCode.success).json({
        status: true,
        message: "New Category created successfully",
        data,
      });
    })
    .catch((error) => {
      var errors = DBerror(error);
      res.status(ResponseCode.errorCode.serverError).json({
        status: false,
        message: errors,
        error: "Server Error ! data not found !",
      });
    });
};

const viewAll = async (req, res) => {
  categoryModel
    .aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ])
    .then((data) => {
      return res.status(ResponseCode.errorCode.success).json({
        status: true,
        message: "Get All viewAll  Successfully",
        data: data,
      });
    })
    .catch((error) => {
      var errors = DBerror(error);
      return res.status(ResponseCode.errorCode.serverError).json({
        status: false,
        message: "Server error. Please try again.",
        error: errors,
      });
    });
};

const questionCreate = async (req, res) => {
  const v = new Validator(req.body, {
    name: "required",
  });
  let matched = await v.check().then((val) => val);
  if (!matched) {
    return res
      .status(ResponseCode.errorCode.dataNotmatch)
      .send({ status: false, error: v.errors, message: InputError(v.errors) });
  }

  let categoryData = {
    ...req.body,
  };
  const category = new questionModel(categoryData);
  return category
    .save()
    .then((data) => {
      return res.status(ResponseCode.errorCode.success).json({
        status: true,
        message: "New question created successfully",
        data,
      });
    })
    .catch((error) => {
      var errors = DBerror(error);
      res.status(ResponseCode.errorCode.serverError).json({
        status: false,
        message: errors,
        error: "Server Error ! data not found !",
      });
    });
};

const questionEachCategory = async (req, res) => {
  questionModel
    .aggregate([
      {
        $match: {
          isDeleted: false,
          categoryID: { $in: [req.params.categoryID] },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ])
    .then((data) => {
      return res.status(ResponseCode.errorCode.success).json({
        status: true,
        message: "Get All viewAll  Successfully",
        data: data,
      });
    })
    .catch((error) => {
      var errors = DBerror(error);
      return res.status(ResponseCode.errorCode.serverError).json({
        status: false,
        message: "Server error. Please try again.",
        error: errors,
      });
    });
};

const bulkQuestion = async (req, res) => {
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
        fs.createReadStream(imageFile)
          .pipe(csv())
          .on("data", (data) => {
            console.log(data);
            let questionData = {
              name: data.category,
              categoryID: [req.body.categoryID]
            };
            console.log("questionData", questionData);
            const category = new questionModel(questionData);
            return category.save();
          })
          .on("end", () => {
            fs.unlink(imageFile, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                  return;
                }
                console.log('File deleted successfully');
              });
            return res.status(ResponseCode.errorCode.success).json({
                status: true,
                message: "New Category added"                
              }); 
          });
      }
    }
  }); 
};

module.exports = {
  create,
  viewAll,
  questionCreate,
  questionEachCategory,
  bulkQuestion,
};
