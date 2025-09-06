const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { IncomingForm } = require('formidable');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/upload') {
    const form = new IncomingForm({
        multiples: false,
        uploadDir: uploadDir,
        keepExtensions: true,
        filename: (name, ext, part, form) => {
            return part.originalFilename; // keep original file name
        }
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('File upload error: ' + err.message);
            return;
        }

        const uploadedFile = files.myFile;
        if (!uploadedFile || uploadedFile.length === 0) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('No file uploaded');
            return;
        }

        const savedFile = uploadedFile[0];

        res.writeHead(302, { Location: '/success.html' });
        res.end();;
    });
    }else {
        // Serve static files from /public
        let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                } else {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Server Error: ' + err.code);
                }
            } else {
                res.writeHead(200, { 'Content-Type': mime.lookup(filePath) || 'application/octet-stream' });
                res.end(content);
            }
        });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
