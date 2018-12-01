const fs = require('fs');
var path = require('path');

async function saveImage(filename, image) {
    const stream = fs.createWriteStream(`../images/${filename}${path.extname(image.hapi.filename)}`);
    image.pipe(stream);
}

async function getVideoURL(id) {
    if (!fs.existsSync(`../videos/${id}.mp4`)) return null;
    return `http://localhost:9000/${id}.mp4`;
}

async function createVideo(id) {

}

module.exports = {
    saveImage,
    getVideoURL
};