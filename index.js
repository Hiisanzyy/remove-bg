// Remove Background Image
const express = require('express');
const app = express();
const setting = require('./setting.json');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const { processImage } = require('./lib/process');
const { exec } = require('child_process');

if (!fs.existsSync(path.join(__dirname, 'temporary'))) {
    console.log('Creating Temporary Folder...');
    fs.mkdirSync(path.join(__dirname, 'temporary'));
}

// Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use("/files", express.static(path.join(__dirname, 'temporary')));
app.set('views', path.join(__dirname, 'views'));

// Multer ( File Upload )
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'temporary'),
    filename: function (req, file, cb) {
        cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname));
    }
});

// Limit File Size ( 10 MB )
const upload = multer({ storage: storage, limits: { fileSize: 1048576 * 10 } });

// Index Page
app.get('/', (req, res) => {
    res.render('index', { ...setting });
});

// Upload Image
app.post("/api/process/nobg", upload.single('image'), async (req, res) => {
    if (req.file) {
        if (req.file.mimetype != "image/png" && req.file.mimetype != "image/jpeg") {
           fs.unlinkSync(req.file.path);
          return res.json({ error: "Only PNG and JPEG Image Allowed" });
        }
        try {
            processImages = await processImage(req.file.path);
        fileid = crypto.randomBytes(16).toString('hex') + path.extname(req.file.originalname);
            dts = "./temporary/"+fileid;
            await fs.promises.writeFile(dts, processImages);
            res.json({ image: "/files/"+ fileid });
        } catch (error) {
            res.json({ error: "Unknown Error, Please Try Again" });
            fs.unlinkSync(req.file.path);
            console.log(error);
        }
        fs.unlinkSync(req.file.path);
        console.log(req.file.path);
    } else {
        res.status(400).json({ error: "Please Upload some Image" });
    }
});

// Start Server
app.listen(process.env.PORT || 3000, () => {
    console.log('Server Started on Port ' + (process.env.PORT || 3000));
});
