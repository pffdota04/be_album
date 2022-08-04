const Image = require("./../../models/Images/Image");
const fs = require("fs");
const fsExtra = require("fs-extra");

const path = require("path");
//upload image
const handleError = (err, res) => {
  res.status(500).contentType("text/plain").end("Oops! Something went wrong!");
};

const uploadAnImage = async (req, res) => {
  const random = Math.random().toString(36).slice(2);
  const filename = random + "-" + req.file.originalname;
  const tempPath = req.file.path;

  const targetPath = path.join(__dirname, "./../../imgs/" + filename);
  fs.rename(tempPath, targetPath, (err) => {
    console.log(err);
    if (err) return handleError(err, res);
    const img = new Image({
      name: req.body.name,
      albumId: req.body.albumId,
      createBy: req.body.createBy,
      filename: filename,
      sharedTo: JSON.parse(req.body.sharedTo),
    });
    img.save();
    getDzi(req, res, filename);
  });
};

// GET IMG CUSTOM SIZE
const sharp = require("sharp");
function resize(path, format, width, height) {
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

const getAnCustomImage = (req, res) => {
  console.log(req.query);
  // xử lý check ảnh
  const widthStr = req.query.w;
  const heightStr = req.query.h;
  const format = req.query.format;
  let width, height;
  if (widthStr) width = parseInt(widthStr);
  if (heightStr) height = parseInt(heightStr);
  res.type(`image/${format || "png"}`);
  resize("imgs/" + req.query.file, format, width, height).pipe(res);
};

const getAnImage = (req, res) => {
  res.sendFile(req.query.file, { root: "./imgs" });
};

const getAnImageInfo = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const img = await Image.findById(id);
    console.log(img);
    res.send({
      _id: img._id,
      name: img.name,
      albumId: img.albumId,
      createBy: img.createBy,
      countShare: img.sharedTo.length,
      uploadDay: img.uploadDay,
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

// create file.dzi and folder containing images
var admZip = require("adm-zip");
const getDzi = async (req, res, filename) => {
  sharp("imgs/" + filename)
    .png()
    .tile({
      size: 256,
      overlap: 2,
      layout: "dz",
    })
    .toFile("imgs/" + filename + ".zip")
    .then((info) => {
      console.log(info);
      unzip(filename);
      res.status(200).contentType("text/plain").end("File uploaded!");
    })
    .catch((e) => res.status(500).send(e.message));
};

const unzip = (filename) => {
  var zip = new admZip("imgs/" + filename + ".zip");
  const endPath = path.join(__dirname, `../../imgs/`);
  zip.extractAllTo(endPath, true);
  fs.unlinkSync(path.join(__dirname, `../../imgs/` + filename + ".zip"));
};

const getFolderDzi = async (req, res) => {
  res.sendFile(req.params.name, {
    root: "./imgs/hill-XKPAQ1/hill_files/" + req.params.number,
  });
};

module.exports = {
  uploadAnImage,
  getAnImage,
  getAnCustomImage,
  getImagesByAlbumId,
  getDzi,
  getFolderDzi,
  getAnImageInfo,
};
