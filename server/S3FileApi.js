const S3 = require('aws-sdk/clients/s3');
const SQS = require('aws-sdk/clients/sqs');
const s3 = new S3();
const sqs = new SQS({ region: 'us-east-2' });

async function saveImage(filename, image, ext) {
    console.log('saving image');
    await s3.upload({
        Bucket: process.env.S3_BUCKET,
        Key: `images/${filename}${ext}`,
        Body: image
    }).promise();
}

async function getVideoURL(id) {
    return `${process.env.CDN_URL}/${id}.mp4`;
}

async function createVideo(id) {
    console.log('sending request to create video');
    await sqs.sendMessage({
        QueueUrl: process.env.RENDERING_QUEUE_URL,
        MessageBody: id,
        DelaySeconds: 0
    }).promise();
}

module.exports = {
    saveImage,
    getVideoURL,
    createVideo
};