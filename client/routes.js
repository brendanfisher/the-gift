import * as r from 'next-routes';

const routes = r
    .add('index')
    .add('gift', '/gift/:id');

export routes;