const Image = require("./../../models/Images/Image");
const fs = require("fs");
const fsExtra = require("fs-extra");
const { oneUserByMail } = require("../user/userControl");
const { findAlbumById } = require("../album/albumControl");
global.globalString = {};

const path = require("path");

// GET IMG CUSTOM SIZE
const sharp = require("sharp");
function resize(path, format, width, height) {
  console.log(path);
  const readStream = fs.createReadStream(path);
  let transform = sharp();
  if (format) {
    transform = transform.toFormat(format);
  }
  if (width || height) {
    transform = transform.resize(width, height);
  }
  return readStream.pipe(transform);
}

const getAnCustomImage = async (req, res) => {
  const img = await getImageByFilename(req.query.file);
  if (isOwner(img, req.user._id) || isShared(img, req.user._id)) {
    const widthStr = req.query.w;
    const heightStr = req.query.h;
    const format = req.query.format;
    let width, height;
    if (widthStr) width = parseInt(widthStr);
    if (heightStr) height = parseInt(heightStr);
    res.type(`image/${format || "png"}`);
    let path = "./imgs/" + req.query.file.split(".")[0] + "/" + req.query.file;
    if (fs.existsSync(path)) {
      resize(path, format, width, height).pipe(res);
    } else {
      resize("./imgs/404.png", format, width, height).pipe(res);
    }
  } else {
    // res.send("Bạn không có quyền xem ảnh này");
    res.sendFile("notshare.png", {
      root: "./imgs/",
    });
  }
};

const getAnImage = async (req, res) => {
  const img = await getImageByFilename(req.query.file);

  const path = "./imgs/" + req.query.file.split(".")[0];
  if (fs.existsSync(path) && isOwner(img, req.user._id))
    res.sendFile(req.query.file, {
      root: path,
    });
  else
    res.sendFile("404.png", {
      root: "./imgs/",
    });
};

const getAnImageInfo = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const img = await Image.findById(id);
    if (isOwner(img, req.user._id) || isShared(img, req.user._id))
      res.send({
        _id: img._id,
        name: img.name,
        albumId: img.albumId,
        createBy: img.createBy,
        filename: img._id,
        width: img.width,
        height: img.height,
        countShare: img.sharedTo.length,
        uploadDay: img.uploadDay,
        status: true,
      });
    else
      res.send({
        _id: img._id,
        name: img.name,
        uploadDay: img.uploadDay,
        status: false,
      });
  } catch (error) {
    console.log(error);
    res.status(404).send({
      message: error.message,
    });
  }
};

const getImagesByAlbumId = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const imgs = await Image.find({ albumId: id });
  res.send(imgs);
};

//upload image
const uploadAnImage = async (req, res) => {
  try {
    const img = new Image({
      name: req.body.name,
      albumId: req.body.albumId,
      createBy: req.user._id,
    });
    console.log(img._id);

    let exten = req.file.originalname.split(".");
    const filename = img._id + "." + exten[exten.length - 1];
    const tempPath = req.file.path;
    const handle = handleUpload(req.body.albumId, filename, tempPath, img);
    if (handle) res.status(200).contentType("text/plain").end("File uploaded!");
    else res.status(200).contentType("text/plain").end("SAIIIII ROI");
  } catch (error) {
    console.log(error);
  }
};

// create file.dzi and folder containing images (inside .zip)
// sau đó unzip và remove .zip
var admZip = require("adm-zip");

const handleUpload = async (albumId, filename, tempPath, img, uploadKey, i) => {
  try {
    const album = await findAlbumById(albumId); //check album exist
    if (album) {
      const info = await sharp(tempPath)
        .png()
        .tile({
          size: 256,
          overlap: 2,
          layout: "dz",
        })
        .toFile("imgs/" + filename.split(".")[0] + ".zip");
      const endPath = path.join(__dirname, "../../imgs/");

      await unzip(filename.split(".")[0], endPath, async () => {});
      await sharp(tempPath)
        .resize(null, 300, {
          kernel: sharp.kernel.nearest,
          fit: "contain",
          position: "right top",
          background: { r: 255, g: 255, b: 255, alpha: 0.5 },
        })
        .toFile(
          endPath +
            "/" +
            filename.split(".")[0] +
            "/" +
            filename.split(".")[0] +
            ".png"
        );

      fs.unlinkSync(tempPath);
      img.width = info.width;
      img.height = info.height;
      img.save();
      album.totalImage = album.totalImage + 1;
      album.save();
      console.log("LET TRUE <<<<<<<<<<<<<<");
      // globalString[uploadKey][i] = true;
      return true;
    } else {
      // globalString[uploadKey][i] = null;
      return null;
    }
  } catch (error) {
    console.log(error);
    // globalString[uploadKey][i] = false;
    return false;
  }
};

const unzip = (filename, endPath, callback) => {
  return new Promise((resolve, reject) => {
    try {
      var zip = new admZip("imgs/" + filename + ".zip");
      zip.extractAllTo(endPath, true);
      fs.unlinkSync(path.join(__dirname, `../../imgs/` + filename + ".zip"));
      // callback();
      resolve("ok");
    } catch (error) {
      reject(error);
    }
  });
  //
};

const test = async (req, res) => {
  if (globalString[req.query.key]) {
    res.send(globalString[req.query.key]);
    if (globalString[req.query.key][globalString[req.query.key].length] !== 0)
      globalString[req.query.key] = true;
    if (globalString[req.query.key] === true)
      delete globalString[req.query.key];
  } else res.send(false);
};

//upload multiple
const uploadMultiple = async (req, res) => {
  try {
    // const uploadkey = req.body.uploadkey;
    const uploadKey = (Math.random() + 1).toString(36).substring(2);
    globalString[uploadKey] = new Array(req.files.length).fill(0);
    // [0,0,0,0,0,0,0,0]
    res.send(uploadKey);
    let result = new Array(req.files.length);
    // let result = [];
    for (let i = 0; i < req.files.length; i++) {
      const img = new Image({
        name: req.body.name[i],
        albumId: req.body.albumId,
        createBy: req.user._id,
      });
      let exten = req.files[i].originalname.split(".");
      const filename = img._id + "." + exten[exten.length - 1];
      const tempPath = req.files[i].path;

      const a = await handleUpload(
        req.body.albumId,
        filename,
        tempPath,
        img,
        uploadKey,
        i
      );

      globalString[uploadKey][i] = a;

      // result.push(a);
      result[i] = a;

      if (i + 1 === req.files.length) {
        // res.send(result);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const getFolderDzi = async (req, res) => {
  // files number name
  res.sendFile(req.params.name, {
    root:
      "./imgs/" +
      req.params.file +
      "/" +
      req.params.file +
      "_files/" +
      req.params.number,
  });
};

const deleteImage = async (req, res) => {
  try {
    const imgs = await Image.findById(req.query._id);
    console.log(imgs);
    if (!imgs) throw new Error("Image not found");
    if (isOwner(imgs, req.user._id)) {
      console.log("removing... " + imgs._id);
      imgs.remove();

      // remove file--------
      fsExtra.removeSync("imgs/" + imgs.filename.split(".")[0]);

      res.send("ok");
    } else throw new Error("You are not owner!");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

// img id; user target id; owner info
const shareAnImage = async (req, res) => {
  try {
    const _id = req.body._id;
    const targer_email = req.body.email;
    const imgs = await Image.findById(_id);
    if (!imgs) throw new Error("Image not found");
    if (isOwner(imgs, req.user._id)) {
      // User (push to user.sharedImages)
      const user = await oneUserByMail(targer_email);
      if (!user) throw new Error("User target not found");
      if (!user.sharedImages.includes(_id)) {
        user.sharedImages.push(_id);
        user.save();
      }

      // Image (push to imgs.sharedTo)
      if (!imgs.sharedTo.includes(user._id)) {
        imgs.sharedTo.push(user._id);
        imgs.save();
      }

      res.send("ok");
    } else throw new Error("You are not owner!");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const unShareAnImage = async (req, res) => {
  try {
    const _id = req.body._id; //img
    const targer_email = req.body.email;
    const imgs = await Image.findById(_id);
    if (!imgs) throw new Error("Image not found");
    if (isOwner(imgs, req.user._id)) {
      // User (remove from user.sharedImages)
      const user = await oneUserByMail(targer_email);
      if (!user) throw new Error("User target not found");
      const index = user.sharedImages.indexOf(_id);
      if (index > -1) {
        user.sharedImages.splice(index, 1);
        user.save();
      }

      // Image (push to imgs.sharedTo)'
      const index2 = imgs.sharedTo.indexOf(user._id);
      if (index2 > -1) {
        imgs.sharedTo.splice(index, 1);
        imgs.save();
      }

      res.send("ok");
    } else throw new Error("You are not owner!");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const renameImage = async (req, res) => {
  const { _id, to } = req.query;
  console.log(_id);
  console.log(to);
  const img = await Image.findById(_id);
  if (img && isOwner(img, req.user._id)) {
    img.name = to;
    img.save();
    res.send("ok");
  } else res.status(404).send("Image not found or you are not owner");
};

const isOwner = (img, uid) => {
  return uid === img.createBy;
};

const isShared = (img, uid) => {
  return img.sharedTo.includes(uid);
};

const getImageByFilename = async (filename) => {
  return await Image.findOne({ filename: filename });
};

module.exports = {
  uploadAnImage,
  getAnImage,
  getAnCustomImage,
  getImagesByAlbumId,
  getFolderDzi,
  getAnImageInfo,
  deleteImage,
  shareAnImage,
  unShareAnImage,
  renameImage,
  uploadMultiple,
  test,
};
