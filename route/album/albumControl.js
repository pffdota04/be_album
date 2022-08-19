const Image = require("../../models/Images/Image");
const Album = require("./../../models/Albums/Album");

// const { getImagesByAlbumId, deleteAnImage } = require("./../image/imgControl");

const postAnAlbum = (req, res) => {
  try {
    const alb = new Album({
      uid: req.user._id,
      name: req.body.name,
    });
    alb.save();
    res.send("Created");
  } catch (error) {
    res.status(500);
  }
};
const getMyAlbum = async (req, res) => {
  // const myAlbum = new Album()
  const myAlbum = await Album.find({ uid: req.user._id }).exec();
  console.log(myAlbum);
  res.send(myAlbum);
};

const renameAlbum = async (req, res) => {
  try {
    const { _id, newName } = req.body;
    const myAlbum = await Album.findById(_id);
    if (myAlbum && isOwnerAlbum(myAlbum, req.user._id)) {
      myAlbum.name = newName;
      myAlbum.lastUpdate = new Date();
      myAlbum.save();
      res.send(myAlbum);
    } else throw new Error("album not exist");
  } catch (error) {
    res.send(error);
  }
};

const removeAlbum = async (req, res) => {
  try {
    const { _id } = req.query;
    const myAlbum = await findAlbumById(_id);
    console.log(myAlbum);
    if (myAlbum && isOwnerAlbum(myAlbum, req.user._id)) {
      console.log("removing... ");
      const allImg = await Image.find({ albumId: _id });
      console.log(allImg);
      allImg.map((e) => {
        deleteAnImage(e._id);
      });
      myAlbum.remove();
      res.send("ok");
    } else throw new Error("album not exist");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
const fsExtra = require("fs-extra");
const { oneUserByMail } = require("../user/userControl");

const deleteAnImage = async (id) => {
  try {
    const img = await Image.findById(id);
    if (img) {
      await img.remove();
      fsExtra.removeSync("imgs/" + id);
      return true;
    } else return false;
  } catch (error) {
    console.log(error);
  }
};

const getAlbumById = async (req, res) => {
  try {
    const myAlbum = await findAlbumById(req.params.id);
    console.log(myAlbum);
    if (!myAlbum) throw 0;
    if (
      isSharedAlbum(myAlbum, req.user._id) ||
      isOwnerAlbum(myAlbum, req.user._id)
    )
      res.send(myAlbum);
    else throw new Error("denied");
  } catch (error) {
    console.log(error);
    res.status(200).send(error.message);
  }
};

const getAlbum = async (req, res) => {
  try {
    const myAlbum = await findAlbumById(req.params.id);
    console.log(myAlbum);
    if (!myAlbum) throw 0;
    if (
      isSharedAlbum(myAlbum, req.user._id) ||
      isOwnerAlbum(myAlbum, req.user._id)
    )
      res.send(myAlbum);
    else throw new Error("denied");
  } catch (error) {
    console.log(error);
    res.status(200).send(error.message);
  }
};

const unShareAlbum = async (req, res) => {
  try {
    const _id = req.body._id; //img
    const targer_email = req.body.email;
    const album = await Album.findById(_id);
    if (!album) throw new Error("Album not found");
    if (isOwnerAlbum(album, req.user._id)) {
      // User (remove from user.sharedImages)
      const user = await oneUserByMail(targer_email);
      if (!user) throw new Error("User target not found");
      const index = user.sharedAlbums.indexOf(_id);
      if (index > -1) {
        user.sharedAlbums.splice(index, 1);
        user.save();
      }

      const index2 = album.sharedTo.indexOf(user._id);
      if (index2 > -1) {
        album.sharedTo.splice(index, 1);
        album.save();
      }

      res.send("ok");
    } else throw new Error("You are not owner!");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const shareAlbum = async (req, res) => {
  try {
    const _id = req.body._id; //album id
    const targer_email = req.body.email;
    const album = await Album.findById(_id);
    if (!album) throw new Error("Album not found");
    if (isOwnerAlbum(album, req.user._id)) {
      // User (push to user.sharedAlbums)
      const user = await oneUserByMail(targer_email);
      if (!user) throw new Error("User target not found");
      if (!user.sharedAlbums.includes(_id)) {
        user.sharedAlbums.push(_id);
        user.save();
      }

      if (!album.sharedTo.includes(user._id)) {
        album.sharedTo.push(user._id);
        album.save();
      }

      res.send("ok");
    } else throw new Error("You are not owner!");
  } catch (error) {
    res.status(200).send({
      message: error.message,
    });
  }
};

const sharedToMeAlbum = async (req, res) => {
  try {
    const user = await oneUserByMail(req.user.email);
    console.log(user);
    console.log("22222222222 &&&&&& ?????????");
    if (user.sharedAlbums.length == 0) res.send([]);
    else {
      const listalb = await Album.find({ _id: { $in: user.sharedAlbums } });
      res.send(listalb);
    }
  } catch (error) {
    console.log(error);
  }
};

const changeTotalImage = async (id, isPlus) => {
  try {
    const myAlbum = await Album.findById(id);
    if (isPlus) myAlbum.totalImage = myAlbum.totalImage + 1;
    else myAlbum.totalImage = myAlbum.totalImage - 1;
    myAlbum.save();
    return true;
  } catch (error) {
    return false;
  }
};

const findAlbumById = async (_id) => {
  return await Album.findById(_id);
};

const isOwnerAlbum = (album, uid) => {
  return album.uid == uid;
};

const isSharedAlbum = (album, uid) => {
  console.log(album);
  console.log(uid);
  console.log("-------------------");
  return album.sharedTo.includes(uid);
};

module.exports = {
  postAnAlbum,
  getMyAlbum,
  getAlbum,
  changeTotalImage,
  findAlbumById,
  renameAlbum,
  removeAlbum,
  unShareAlbum,
  shareAlbum,
  isSharedAlbum,
  isOwnerAlbum,
  sharedToMeAlbum,
};
