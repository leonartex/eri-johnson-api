const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');
const { IamAuthenticator } = require('ibm-watson/auth');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Busboy = require('busboy');
var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const visualRecognition = new VisualRecognitionV3({
  url: 'https://gateway.watsonplatform.net/visual-recognition/api',
  version: '2019-11-11',
  authenticator: new IamAuthenticator({ apikey: 'API KEY AQUI' }),
  disableSslVerification: true,
});

app.post('/eri', function (req, res, next) {
  console.log('Começou uma requisição');
  let busboy = new Busboy({ headers: req.headers });

  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    if (mimetype == 'image/png' || mimetype == 'image/jpeg') {
      file.fileRead = [];
      file.on('data', function (data) {
        this.fileRead.push(data);
      });
      file.on('end', function () {
        var finalBuffer = Buffer.concat(this.fileRead);
        console.log('Terminou uma requisição');

        const params = {
          imagesFile: finalBuffer
        };

        visualRecognition.classify(params)
          .then(response => {
            res.json(response.result);
          })
          .catch(err => {
            res.json(err);
          });
      });
    } else {
      console.log('Extensão errada');
    }
  });

  req.pipe(busboy);
});

app.listen(3000, function () {
  console.log('CORS-enabled web server listening on port 3000');
});