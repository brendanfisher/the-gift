const routes = require('next-routes');

module.exports = routes()
    .add('index')
    .add('_error')
    .add('gift', '/gift/:id');