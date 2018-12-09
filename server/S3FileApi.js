const S3 = require('aws-sdk/clients/s3');
const s3 = new S3();

async function saveImage(filename, image, ext) {
    console.log('saving image');
    await s3.upload({
        Bucket: process.env.S3_BUCKET,
        Key: `images/${filename}${ext}`,
        Body: image
    }).promise();
}

async function getVideoURL(id) {
    console.log('checking for video');
    try {
        // Check if the file exists
        await s3.headObject({
            Bucket: process.env.S3_BUCKET,
            Key: `videos/${id}.mp4`
        }).promise();
        // File exists, so return the url from CloudFront
        return `${process.env.CDN_URL}/${id}.mp4`;
    } catch (e) {
        // File doesn't exist, which throws an error
        if (e.code === 'NotFound') return null;
        throw e;
    }
}

async function createVideo(id) {
    //TODO: spin up video process
}

module.exports = {
    saveImage,
    getVideoURL,
    createVideo
};