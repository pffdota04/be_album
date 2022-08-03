const Image = require("./../../models/Images/Image");
const fs = require("fs");
const path = require("path");
//upload image
const handleError = (err, res) => {
  res.status(500).contentType("text/plain").end("Oops! Something went wrong!");
};

const uploadAnImage = async (req, res) => {
  const random = Math.random().toString(36).slice(2);
  const tempPath = req.file.path;

  const targetPath = path.join(
    __dirname,
    "./../../imgs/" + random + "-" + req.file.originalname
  );
  fs.rename(tempPath, targetPath, (err) => {
    console.log(err);
    if (err) return handleError(err, res);
    const img = new Image({
      name: req.body.name,
      albumId: req.body.albumId,
      createBy: req.body.createBy,
      filename: random + "-" + req.file.originalname,
      sharedTo: JSON.parse(req.body.sharedTo),
    });
    img.save();
    res.status(200).contentType("text/plain").end("File uploaded!");
  });
};

// GET IMG
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

const getImagesByAlbumId = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const imgs = await Image.find({ albumId: id });
  res.send(imgs);
};

// create file.dzi and folder containing images
const getDzi = async (req, res) => {
  sharp("hill.jpg")
    .png()
    .tile({
      size: 256,
      overlap: 2,
      layout: "dz",
    })
    // .toFile("imgs/hill.dz", function (err, info) {
    //   console.log(info);
    //   console.log(err);
    // });
    .toFile("imgs/hill.dz")
    .then((info) => console.log(info))
    .catch((e) => console.log(e));
  res.send("xxx");
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
};
