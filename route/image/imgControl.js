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
  getDzi(req, res, filename, tempPath);
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
  resize(
    "./imgs/" + req.query.file.split(".")[0] + "/" + req.query.file,
    format,
    width,
    height
  ).pipe(res);
};

const getAnImage = (req, res) => {
  res.sendFile(req.query.file, {
    root: "./imgs/" + req.query.file.split(".")[0] + "/" + req.query.file,
  });
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
      filename: img.filename,
      width: img.width,
      height: img.height,
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

// create file.dzi and folder containing images (inside .zip)
// sau đó unzip và remove .zip
var admZip = require("adm-zip");
const getDzi = async (req, res, filename, tempPath) => {
  sharp(tempPath)
    .png()
    .tile({
      size: 256,
      overlap: 2,
      layout: "dz",
    })
    .toFile("imgs/" + filename.split(".")[0] + ".zip")
    .then((info) => {
      try {
        console.log(info);
        console.log(req.body);
        const img = new Image({
          name: req.body.name,
          albumId: req.body.albumId,
          createBy: req.body.createBy,
          filename: filename,
          width: info.width,
          height: info.height,
          sharedTo: JSON.parse(req.body.sharedTo),
        });
        img.save();

        const endPath = path.join(__dirname, `../../imgs/`);
        unzip(filename.split(".")[0], endPath);
        fs.rename(
          tempPath,
          endPath + filename.split(".")[0] + "\\" + filename,
          (err) => console.log(err)
        );
        res.status(200).contentType("text/plain").end("File uploaded!");
      } catch (error) {
        console.log(error);
      }
    })
    .catch((e) => res.status(500).send(e.message));
};

const unzip = (filename, endPath) => {
  try {
    var zip = new admZip("imgs/" + filename + ".zip");
    zip.extractAllTo(endPath, true);
    fs.unlinkSync(path.join(__dirname, `../../imgs/` + filename + ".zip"));
  } catch (error) {
    console.log(error);
  }
};

const getFolderDzi = async (req, res) => {
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

module.exports = {
  uploadAnImage,
  getAnImage,
  getAnCustomImage,
  getImagesByAlbumId,
  getDzi,
  getFolderDzi,
  getAnImageInfo,
};
