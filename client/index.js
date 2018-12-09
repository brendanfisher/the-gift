const routes = require('./routes');
const next = require('next');
const express = require('express');
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handler = routes.getRequestHandler(app);
const port = process.env.NODE_ENV === 'production' ? process.env.PORT : 3000;

app.prepare().then(() => {
    express().use(handler).listen(port);
});