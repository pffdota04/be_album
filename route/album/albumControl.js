const Album = require("./../../models/Albums/Album");

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

const getAlbumById = async (req, res) => {
  try {
    console.log(req.params.id);
    const myAlbum = await findAlbumById(req.params.id);
    // const myAlbum = await Album.find({ _id: req.params.id }).exec();
    console.log(myAlbum);
    if (!myAlbum) throw 0;
    let denied = true;
    denied = !myAlbum?.sharedTo.includes(req.user._id);
    denied = !myAlbum?.uid == req.user._id;
    console.log(denied);
    if (denied) throw new Error("Denied");
    else res.send(myAlbum);
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: "không tìm thấy" });
    // res.send("không bé ơi");
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

module.exports = {
  postAnAlbum,
  getMyAlbum,
  getAlbumById,
  changeTotalImage,
  findAlbumById,
};
