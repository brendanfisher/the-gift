const fs = require('fs');

async function saveImage(filename, image, ext) {
    const stream = fs.createWriteStream(`../images/${filename}${ext}`);
    //image.pipe(stream); //For when it's a stream
    stream.write(image); //For when it's a buffer
}

async function getVideoURL(id) {
    if (!fs.existsSync(`../videos/${id}.mp4`)) return null;
    return `http://localhost:9000/${id}.mp4`;
}

async function createVideo(id) {
    //TODO: spin up video process
}

module.exports = {
    saveImage,
    getVideoURL,
    createVideo
};