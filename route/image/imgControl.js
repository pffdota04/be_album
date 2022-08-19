const Image = require("./../../models/Images/Image");
const fs = require("fs");
const fsExtra = require("fs-extra");
const { oneUserByMail } = require("../user/userControl");
const {
  findAlbumById,
  isSharedAlbum,
  isOwnerAlbum,
  getAlbumById,
} = require("../album/albumControl");
global.globalString = {};

const path = require("path");

// GET IMG CUSTOM SIZE
const sharp = require("sharp");

const getAnCustomImage = async (req, res) => {
  // const img = await getImageByFilename(req.query.file);
  try {
    const img = await Image.findById(req.query.file.split(".")[0]);
    const album = await findAlbumById(img.albumId);
    if (
      isOwnerImage(img, req.user._id) ||
      isSharedImage(img, req.user._id) ||
      isSharedAlbum(album, req.user._id) ||
      isOwnerAlbum(album, req.user._id)
    ) {
      res.sendFile(req.query.file, {
        root: `./imgs/${req.query.file.split(".")[0]}/`,
      });
    } else {
      // res.send("Bạn không có quyền xem ảnh này");
      res.sendFile("notshare.png", {
        root: "./imgs/",
      });
    }
  } catch (error) {
    res.sendFile("404.png", {
      root: "./imgs/",
    });
  }
};

const getAnImage = async (req, res) => {
  const img = await getImageByFilename(req.query.file);

  const path = "./imgs/" + req.query.file.split(".")[0];
  if (fs.existsSync(path) && isOwnerImage(img, req.user._id))
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
    const img = await Image.findById(id);
    const album = await findAlbumById(img.albumId);
    if (
      isOwnerImage(img, req.user._id) ||
      isSharedImage(img, req.user._id) ||
      isSharedAlbum(album, req.user._id) ||
      isOwnerAlbum(album, req.user._id)
    )
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

const imageInAlbum = async (req, res) => {
  const id = req.params.id;
  // const album = await findAlbumById(id);
  // if(isOwnerImage())
  const imgs = await getImagesByAlbumId(id);
  res.send(imgs);
};

const getImagesByAlbumId = async (id) => {
  return await Image.find({ albumId: id });
};

//upload image
const uploadAnImage = async (req, res) => {
  try {
    // const checkAlbum = await getAlbumById()
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

const handleUpload = async (filename, tempPath, img) => {
  try {
    // const album = await findAlbumById(albumId); //check album exist
    // if (album) {
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
    // album.totalImage = album.totalImage + 1;
    // album.save();
    return true;
    // } else {
    //   return null;
    // }
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
      resolve("ok");
    } catch (error) {
      reject(error);
    }
  });
};

const test = async (req, res) => {
  const arr = globalString[req.query.key];
  if (arr) {
    res.send(arr);
    if (arr === true)
      // neu la true => xoa => end
      delete globalString[req.query.key];
    if (arr[arr.length - 1] !== 0)
      // da xu ly xong => true
      globalString[req.query.key] = true;
  } else res.send(false);
};

//upload multiple
const uploadMultiple = async (req, res) => {
  try {
    const album = await findAlbumById(req.body.albumId); //check album exist
    if (album) {
      if (isOwnerAlbum(album, req.user._id)) {
        const uploadKey = (Math.random() + 1).toString(36).substring(2);
        globalString[uploadKey] = new Array(req.files.length).fill(0);

        const name = JSON.parse(req.body.name);
        // [0,0,0,0,0,0,0,0]
        res.send({ key: uploadKey, status: true });
        let result = new Array(req.files.length);
        // let result = [];
        for (let i = 0; i < req.files.length; i++) {
          const img = new Image({
            name: name[i],
            albumId: req.body.albumId,
            createBy: req.user._id,
          });
          let exten = req.files[i].originalname.split(".");
          const filename = img._id + "." + exten[exten.length - 1];
          const tempPath = req.files[i].path;

          const a = await handleUpload(filename, tempPath, img);
          if (a) album.totalImage = album.totalImage + 1;
          globalString[uploadKey][i] = a;
          result[i] = a;
        }
        album.lastUpdate = new Date();
        album.save();
      } else res.send({ message: "You are not the owner", status: false });
    } else res.send({ message: "Album not exist", status: false });
  } catch (error) {
    console.log(error);
  }
};

const getFolderDzi = async (req, res) => {
  // files number name
  //  res.sendFile(name, path)
  res.sendFile(req.params.name, {
    root: `./imgs/${req.params.file}/${req.params.file}_files/${req.params.number}`,
  });
};

const deleteImage = async (req, res) => {
  try {
    const imgs = await Image.findById(req.query._id);
    console.log(imgs);
    if (!imgs) throw new Error("Image not found");
    if (isOwnerImage(imgs, req.user._id)) {
      console.log("removing... " + imgs._id);
      // imgs.remove();
      deleteAnImage(imgs._id);
      const album = await findAlbumById(imgs.albumId); //check album exist
      album.totalImage = album.totalImage - 1;
      album.save();

      // remove file--------
      // fsExtra.removeSync("imgs/" + imgs._id);

      res.send("ok");
    } else throw new Error("You are not owner!");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const deleteAnImage = async (id) => {
  const img = await Image.findById(id);
  if (img) {
    await img.remove();
    fsExtra.removeSync("imgs/" + id);
    return true;
  } else return false;
};

// img id; user target id; owner info
const shareAnImage = async (req, res) => {
  try {
    const _id = req.body._id;
    const targer_email = req.body.email;
    const imgs = await Image.findById(_id);
    if (!imgs) throw new Error("Image not found");
    if (isOwnerImage(imgs, req.user._id)) {
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
    res.status(200).send({
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
    if (isOwnerImage(imgs, req.user._id)) {
      // User (remove from user.sharedImages)
      const user = await oneUserByMail(targer_email);
      if (!user) throw new Error("User target not found");
      const index = user.sharedImages.indexOf(_id);
      if (index > -1) {
        user.sharedImages.splice(index, 1);
        user.save();
      }
      console.log(imgs.sharedTo);
      // Image (push to imgs.sharedTo)'
      const index2 = imgs.sharedTo.indexOf(user._id);
      console.log(index2);
      if (index2 > -1) {
        imgs.sharedTo.splice(index, 1);
        console.log(imgs.sharedTo);
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
  if (img && isOwnerImage(img, req.user._id)) {
    img.name = to;
    img.save();
    res.send("ok");
  } else res.status(404).send("Image not found or you are not owner");
};

const sharedToMeImage = async (req, res) => {
  try {
    const user = await oneUserByMail(req.user.email);
    // console.log
    if (user.sharedImages.length == 0) res.send([]);
    else {
      // console.log(user.sharedImages);
      // console.log(JSON.stringify(user.sharedImages));
      const listimg = await Image.find({ _id: { $in: user.sharedImages } });
      console.log("ok hehe");
      res.send(listimg);
    }
  } catch (error) {
    console.log(error);
  }
};

const myImage = async (req, res) => {
  console.log(req.user._id);
  let startAt = req.query.startAt;
  if (!startAt) startAt = 0;
  startAt = parseInt(startAt);
  console.log(startAt);
  const listimg = await Image.find({ createBy: req.user._id })
    .skip(startAt)
    .limit(5)
    .sort({ uploadDay: -1 });
  res.send(listimg);

  // const listimg = await Image.find({ createBy: req.user._id });
  // res.send(listimg);
};

const isOwnerImage = (img, uid) => {
  return uid === img.createBy;
};

const isSharedImage = (img, uid) => {
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
  imageInAlbum,
  getFolderDzi,
  getAnImageInfo,
  deleteImage,
  shareAnImage,
  unShareAnImage,
  renameImage,
  uploadMultiple,
  test,
  deleteAnImage,
  myImage,
  sharedToMeImage,
};
