const mongoConntect = require("./mongodb");
const Image = require("./models/Images/Image");
var admZip = require("adm-zip");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

let count = 0;
mongoConntect();
let a = 1000;
let nowProgress = [];

async function run() {
  try {
    const uploadWatch = Image.watch();
    uploadWatch.on("change", (change) => {
      if (change.operationType + "" === "insert") {
        if (change.fullDocument.worker === 1) {
          count++;
          console.log(
            count + ": Worker 1 --START: " + change.fullDocument.name
          );
          nowProgress.push(change.fullDocument._id);
          setTimeout(() => handleUpload(change.fullDocument._id + ""), [0]);
          a = a + 2000;
          if (a > 15000) a = 1000;
        }
      }
    });
  } finally {
  }
}
run().catch(console.dir);

const handleUpload = async (id) => {
  const img = await Image.findById(id);
  try {
    var startTime = performance.now();
    console.log("start");
    const info = await sharp("imgs/" + id + ".png")
      .png()
      .tile({
        size: 256,
        id,
        overlap: 2,
        layout: "dz",
      })
      .toFile("imgs/" + id + ".zip");

    const endPath = path.join(__dirname, "imgs/");
    console.log(endPath);
    await unzip(id + ".zip", endPath);

    await sharp("imgs/" + id + ".png")
      .resize(null, 300, {
        kernel: sharp.kernel.nearest,
        fit: "contain",
        position: "right top",
        background: { r: 255, g: 255, b: 255, alpha: 0.5 },
      })
      .toFile(endPath + "/" + id + "/" + id + ".png");

    fs.unlinkSync("imgs/" + id + ".png");
    img.width = info.width;
    img.height = info.height;
    img.status = "complete";
    img.save();
    // img.save();
    var index = nowProgress.indexOf(id);
    if (index !== -1) {
      nowProgress.splice(index, 1);
    }

    var endTime = performance.now();
    console.log(
      `Worker 1 COMPLETE:  ${endTime - startTime} ms for ` + img.name
    );
    return true;
  } catch (error) {
    console.log(`Worker 1 ERROR: ` + img.name);
    img.status = "error";
    img.save();
    fs.unlinkSync("imgs/" + id + ".png");
    return false;
  }
};

const unzip = (filename, endPath) => {
  return new Promise((resolve, reject) => {
    try {
      var zip = new admZip("imgs/" + filename);
      zip.extractAllTo(endPath, true);
      fs.unlinkSync(path.join(__dirname, `imgs/` + filename));
      resolve("ok");
    } catch (error) {
      reject(error);
    }
  });
};

// // 1 phut thi quet 1 lan tim nhung thang
// const checkInit = () => {
//   setInterval(() => {}, 60000);
// };
