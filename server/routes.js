const file = require('./fileApi');
const shortid = require('shortid');

module.exports = function (server) {
    server.route({
        method: 'POST',
        path: '/submit',
        handler: async (request, h) => {
            try {
                if (!request.payload.image) return h.response('Invalid input').code(400);
                const id = shortid.generate();
                await file.saveImage(id, request.payload.image);
                //Add entry to database
                await file.createVideo(id);
                return h.response(200);
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
            return {};
        }
    });

    server.route({
        method: 'POST',
        path: '/update-title',
        handler: async (request, h) => {
            return {};
        }
    });
}