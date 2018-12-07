const file = require('./fileApi');
const shortid = require('shortid');
const db = require('./db');
var path = require('path');

module.exports = function (server) {
    server.route({
        method: 'POST',
        path: '/submit',
        handler: async (request, h) => {
            try { 
                if (!request.payload.image || !request.payload.left || !request.payload.top || !request.payload.width)
                    return h.response('Invalid input').code(400);
                if (await db.rateLimitExceeded(request.info.remoteAddress))
                    return h.response('Rate limit exceeded').code(429);

                const id = shortid.generate();
                const owner = shortid.generate();
                const { image, left, top, width } = request.payload;
                await file.saveImage(
                    id,
                    await file.cropImage(image, parseInt(left), parseInt(top), parseInt(width)),
                    path.extname(image.hapi.filename)
                );
                await db.uploadGift(id, owner, request.info.remoteAddress);
                await file.createVideo(id);

                return h.response({
                    giftID: id,
                    owner: owner
                });
            } catch (e) {
                console.log(e);
                return h.response('Server error').code(500);
            }
        },
        options: {
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data'
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/gift/{id}',
        handler: async (request, h) => {
            try {
                if (!request.params.id)
                    return h.response('Invalid input').code(400);
                const gift = await db.getGift(request.params.id);
                if (gift === null) return h.response('Gift not found').code(404);

                const videoURL = await file.getVideoURL(request.params.id);

                return h.response({
                    videoURL,
                    isOwner: gift.owner === request.query.owner,
                    title: gift.pageTitle
                });
            } catch (e) {
                console.log(e);
                return h.response('Server error').code(500);
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/update-title',
        handler: async (request, h) => {
            try {
                const { id, owner, newName } = request.payload;
                if (!id || !newName)
                    return h.response('Invalid input').code(400);
                const success = await db.updateTitle(id, owner, newName);
                if (!success)
                    return h.response('Gift/owner not found').code(404);
                return h.response();
            } catch (e) {
                console.log(e);
                return h.response('Server error').code(500);
            }
        }
    });
}