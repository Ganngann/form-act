const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const dev = false;
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            // FORCE LE HTTPS (Fix pour o2switch/Passenger qui causait le 400)
            req.headers['x-forwarded-proto'] = 'https';
            
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    }).listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
