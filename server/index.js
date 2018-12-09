const Hapi = require('hapi');
const addRoutes = require('./routes');
const db = require('./db');

const server = Hapi.server({
    host: 'localhost',
    port: process.env.NODE_ENV === 'production' ? process.env.PORT : 8000,
    routes: { cors: true }
});

addRoutes(server);

async function start() {
    try {
        await db.initialize();
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at', server.info.uri);
}

start();