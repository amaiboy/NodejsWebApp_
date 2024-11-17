'use strict';

var http = require('http');
var fs = require('fs');
var path = require('path');

var PORT = process.env.PORT || 1337;

var MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.json': 'application/json; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

var TEXT_MIME_TYPES = [
    'text/html',
    'text/javascript',
    'text/css',
    'application/json',
    'text/plain',
    'application/javascript'
];

/**
 * determines the file path based on the URL
 * @param {string} url - request URL
 * @returns {string} file path
 */
function getFilePath(url) {
    var cleanUrl = url.split('?')[0];
    if (cleanUrl === '/') {
        return './html/index.html';
    }

    if (cleanUrl.startsWith('/css/') ||
        cleanUrl.startsWith('/js/') ||
        cleanUrl.startsWith('/img/')) {
        return '.' + cleanUrl;
    }

    if (cleanUrl.endsWith('.html')) {
        return './html' + cleanUrl;
    }

    return '.' + cleanUrl;
}

/**
 * проверяет, является ли MIME тип текстовым
 * @param {string} mimeType - MIME тип файла
 * @returns {boolean} true если текстовый тип
 */
function isTextMimeType(mimeType) {
    return TEXT_MIME_TYPES.some(function (type) {
        return mimeType.startsWith(type);
    });
}

/**
 * serves static files
 * @param {object} res - HTTP response object
 * @param {string} filePath - path to the file
 * @param {string} contentType - MIME type of the file
 */
function serveStaticFile(res, filePath, contentType) {
    var isText = isTextMimeType(contentType);

    var options = isText ? { encoding: 'utf8' } : undefined;

    fs.readFile(filePath, options, function (err, content) {
        if (err) {
            if (err.code === 'ENOENT') {
                serveStaticFile(res, './html/404.html', 'text/html; charset=utf-8');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('500 Internal Server Error');
            }
            return;
        }

        var headers = {
            'Content-Type': contentType,
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN'
        };

        res.writeHead(200, headers);
        res.end(content);
    });
}

/**
 * handles form submission
 * @param {object} res - HTTP response object
 * @param {string} body - POST request body
 */
function handleFormSubmission(res, body) {
    var parsedData = new URLSearchParams(body);
    var formData = {
        companyName: parsedData.get('companyName'),
        contactName: parsedData.get('contactName'),
        email: parsedData.get('email'),
        phone: parsedData.get('phone'),
        status: parsedData.get('status'),
        responseDate: parsedData.get('responseDate'),
        rating: parsedData.get('rating'),
        contactMethods: parsedData.getAll('contactMethod[]').join(', '),
        comments: parsedData.get('comments')
    };

    var responseHTML = '<!DOCTYPE html>' +
        '<html lang="en">' +
        '<head>' +
        '<meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<meta name="description" content="Information filled in the resume review form">' +
        '<title>The result of the review</title>' +
        '<link rel="stylesheet" href="../css/styles.css">' +
        '</head>' +
        '<body>' +
        '<h1>The result of the review</h1>' +
        '<p><strong>Company name:</strong> ' + formData.companyName + '</p>' +
        '<p><strong>Contact person:</strong> ' + formData.contactName + '</p>' +
        '<p><strong>Email:</strong> ' + formData.email + '</p>' +
        '<p><strong>Phone number:</strong> ' + formData.phone + '</p>' +
        '<p><strong>Status:</strong> ' + formData.status + '</p>' +
        '<p><strong>Response date:</strong> ' + formData.responseDate + '</p>' +
        '<p><strong>Evaluation:</strong> ' + formData.rating + '</p>' +
        '<p><strong>Communication methods:</strong> ' + formData.contactMethods + '</p>' +
        '<p><strong>Comments:</strong> ' + formData.comments + '</p>' +
        '<a href="/index.html">Return</a>' +
        '</body>' +
        '</html>';

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(responseHTML);
}

var server = http.createServer(function (req, res) {
    if (req.method === 'POST' && req.url === '/submit') {
        var body = '';
        req.on('data', function (chunk) {
            body += chunk.toString('utf8');
        });
        req.on('end', function () {
            handleFormSubmission(res, body);
        });
        return;
    }

    var filePath = getFilePath(req.url);
    var extname = path.extname(filePath).toLowerCase();
    var contentType = MIME_TYPES[extname] || 'application/octet-stream';

    serveStaticFile(res, filePath, contentType);
});

server.listen(PORT, function () {
    console.log('Server running at http://localhost:' + PORT + '/');
});

server.on('error', function (error) {
    if (error.code === 'EADDRINUSE') {
        console.error('Port ' + PORT + ' is already in use');
        process.exit(1);
    } else {
        console.error('Server error:', error.code);
    }
});

process.on('SIGTERM', function () {
    server.close(function () {
        console.log('HTTP server closed');
        process.exit(0);
    });
});