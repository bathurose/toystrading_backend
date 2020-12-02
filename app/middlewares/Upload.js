const multer = require("multer");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, global.CLOUD_API.rootPath + "/image/");
  },
  
  filename: (req, file, callback) => {
   
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      var message = `${file.originalname} is invalid. Only accept png/jpeg.`;
      return callback(message, null);
    }

  //  var filename = `${Date.now()}-bezkoder-${file.originalname}`;
    callback(null, file.originalname);
    // callback(null, `${new Date().toISOString()+file.originalname}`);
  }
  // filename: (req, file, cb) => {
  //   cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
  // },
});

var uploadFile = multer({ storage: storage});
module.exports = uploadFile;