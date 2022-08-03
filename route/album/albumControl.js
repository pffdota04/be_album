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
    const myAlbum = await Album.find({ _id: req.params.id }).exec();
    console.log(myAlbum);
    if (!myAlbum) throw 0;
    let denied = true;
    denied = !myAlbum[0].sharedTo.includes(req.user._id);
    denied = !myAlbum[0].uid == req.user._id;
    console.log(denied);
    if (denied) throw 0;
    else res.send(myAlbum[0]);
  } catch (error) {
    console.log(error);
    res.send("không bé ơi");
  }
};

module.exports = {
  postAnAlbum,
  getMyAlbum,
  getAlbumById,
};
