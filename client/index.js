import { routes } from './routes';
import * as next from 'next';
import * as http from 'http';

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
    http(handler).listen(3000)
});