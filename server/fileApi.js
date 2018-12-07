const Jimp = require('jimp');
const toArray = require('stream-to-array');

async function cropImage(image, left, top, width) {
    const arr = await toArray(image);
    const cropped = await Jimp.read(Buffer.concat(arr));
    cropped.crop(left, top, width, width);
    cropped.resize(640, 640);
    return await cropped.getBufferAsync(Jimp.AUTO);
}

const implementation = process.env.USE_MOCK_FILESYSTEM ? require('./mockFileApi') : require('./S3FileApi');

module.exports = Object.assign({ cropImage }, implementation);