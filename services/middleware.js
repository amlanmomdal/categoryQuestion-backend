var user = {};
const UserController = require("../Controller/Auth/user")
//Middleware
const permission = [];

user.middleware = async (req, res, next) => {
  if (permission.filter((it) => it.url == req.url).length > 0) {
    next();
  } else {
    if (!req.headers.authorization) {
      return res.status(200).json({
        error: "No credentials sent!",
        status: false,
        credentials: false,
      });
    } else {
      let authorization = req.headers.authorization;
      let userData = null;
      let userType =
        typeof req.headers.usertype != "undefined"
          ? req.headers.usertype
          : "user";
      
      if (userType == "user") {
        userData = await UserController.getTokenData(authorization);
      }

      if (userData && userData != null) {
        userData.password = null;
        req.user = userData;
        req.userType = userType;
        (req.token = req.headers.authorization),
          next();
      } else {
        console.log(userData)
        res.status(401).json({
          error: "credentials not match",
          status: false,
          credentials: false,
        });
      }
    }
  }
};

module.exports = user;
