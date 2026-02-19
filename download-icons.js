
const fs = require('fs');
const https = require('https');
const path = require('path');

const files = [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/c/dc/PayU_corporate_logo.png', dest: 'public/payments/payu.png' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg', dest: 'public/payments/visa.png' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg', dest: 'public/payments/mastercard.png' }
];

files.forEach(file => {
    const fileDest = path.join(__dirname, 'apps/web', file.dest);
    const dir = path.dirname(fileDest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const fileStream = fs.createWriteStream(fileDest);
    https.get(file.url, response => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Downloaded ${file.dest}`);
        });
    }).on('error', err => {
        fs.unlink(fileDest, () => { });
        console.error(`Error downloading ${file.url}: ${err.message}`);
    });
});
