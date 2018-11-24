module.exports = function(server) {
    server.route({
        method: 'POST',
        path: '/submit',
        handler: (request, h) => {
            return {};
        }
    });

    server.route({
        method: 'GET',
        path: '/gift/{id}',
        handler: (request, h) => {
            return {};
        }
    });

    server.route({
        method: 'POST',
        path: '/update-title',
        handler: (request, h) => {
            return {};
        }
    });
}