const file = require('./fileApi');
const shortid = require('shortid');
const db = require('./db');

module.exports = function (server) {
    server.route({
        method: 'POST',
        path: '/submit',
        handler: async (request, h) => {
            try {
                if (!request.payload.image)
                    return h.response('Invalid input').code(400);
                if (await db.rateLimitExceeded(request.info.remoteAddress))
                    return h.response('Rate limit exceeded').code(429);

                const id = shortid.generate();
                const owner = shortid.generate();
                await file.saveImage(id, owner, request.payload.image);
                await db.uploadGift(id, request.info.remoteAddress);
                await file.createVideo(id);

                return h.response(200);
            } catch (e) {
                //TODO: rollback if anything fails
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
            return {};
        }
    });

    server.route({
        method: 'POST',
        path: '/update-title',
        handler: async (request, h) => {
            return {};
        },
        options: {
            payload: {
                allow: 'text/json'
            }
        }
    });
}