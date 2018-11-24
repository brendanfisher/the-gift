const Hapi = require('hapi');
const addRoutes = require('./routes');

const server = Hapi.server({
    host: 'localhost',
    port: 8000
});

addRoutes(server);

async function start() {
    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at', server.info.uri);
}

start();