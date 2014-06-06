var express = require('express'),
    baseRouter = express.Router(),
    imageRouter = express.Router(),
    dust = require('dustjs-linkedin'),
    consolidate = require('consolidate'),
    routes = require('./routes'),
    fs = require('fs'),
    gm = require('gm'),
    app = express();

/* Set up app*/
app.engine('dust', consolidate.dust);
app.set('template_engine', 'dust');
app.set('view engine', 'dust');
app.set('domain', 'localhost');
app.set('views', __dirname + '/views');
app.set('title', 'Jon\'s image resizer test');
/* Define router */
app.use('/', baseRouter);
baseRouter.get('/', routes.index);
baseRouter.use(function (req, res, next) {
    console.log('base route: ' + req.method + '; Using: ' + req.headers['user-agent']);
    // res.render('index');
    next();
});
app.use('/images', imageRouter);
imageRouter.use(function (req, res, next) {
    console.log('image route: ' + req.method + '; Using: ' + req.headers['user-agent']);
    next();
});
imageRouter.param('image', function (req, res, next, img) {
    function isKnownImage (fileName) {
        var extension = fileName.slice(fileName.indexOf('.'), fileName.length).toLowerCase();
        return extension === '.jpeg' || extension === '.jpg' || extension === '.png' || extension === '.bmp' || extension === '.gif' || extension === '.tiff';
    }
    req.image = {
        isKnown: isKnownImage(img),
        orig: img,
        opt: ''
    };
    console.log('Image requested: ' + req.image.orig);
    next();
});
imageRouter.route('/:image')
    .all(function (req, res, next) {
        var queryStr = req.query;
        queryStr.maxside = queryStr.maxside || null;
        queryStr.height = queryStr.height || null;
        queryStr.width = queryStr.width || null;
        queryStr.nocache = queryStr.nocache || null;
        console.log(queryStr);
        function sendImage (file, isNew) {
            isNew = isNew || false;
            if (isNew) {
                console.log('Sending optimized file: ' + file);
            } else {
                console.log('Sending original file: ' + file);
            }
            res.sendfile(file, {root: './images'});
        }
        function gmWriteSuccess (err) {
            if (err) {
                console.log('Error resizing image.');
            } else {
                console.log('New image data created.');
                sendImage(req.image.opt, true);
            }
        }
        function readWriteImage (w, h) {
            fs.readFile('images/' + req.image.orig, function (err, data) {
                if (err) {
                    sendImage(req.image.orig, false);
                    return console.log('Original '+ req.image.orig + ' data could not be read: ' + err);
                } else {
                    console.log('Original '+ req.image.orig + ' data read.');
                    if (!queryStr.nocache && fs.existsSync('images/' + req.image.opt)) {
                        console.log('Sized image exists: ' + req.image.opt);
                        sendImage(req.image.opt, true);
                    } else {
                        fs.writeFile('images/' + req.image.opt, data, function (newErr, newData) {
                            if (err) {
                                sendImage(req.image.orig, false);
                                fs.unlink('images/' + req.image.opt);
                                return console.log('Could not process new ' + req.image.orig + ': ' + err);
                            } else {
                                console.log('images/' + req.image.opt);
                                gm('images/' + req.image.opt)
                                    .resize(w, h)
                                    .write('images/' + req.image.opt, function (err) {
                                        gmWriteSuccess(err);
                                    });
                            }
                        });
                    }
                }
            });
        }
        if (req.image.isKnown && (queryStr.maxside || queryStr.height || queryStr.width)) {
            console.log('Resizing ' + req.image.orig);
            if (queryStr.maxside) {
                gm('images/' + req.image.orig).size(function (err, size) {
                    if (err) {
                        console.log('Could not get ' + req.image.orig + ' size.');
                    } else {
                        req.image.opt = '_optimized/' + req.image.orig.replace('.', '-max' + queryStr.maxside + '.');
                        if (size.width > size.height) {
                            readWriteImage(queryStr.maxside, null);
                        } else {
                            readWriteImage(null, queryStr.maxside);
                        }
                    }
                });
            } else {
                if (queryStr.width && !queryStr.height) {
                    req.image.opt = '_optimized/' + req.image.orig.replace('.', '-w' + queryStr.width + '.');
                    readWriteImage(queryStr.width);
                } else if (queryStr.width && queryStr.height) {
                    req.image.opt = '_optimized/' + req.image.orig.replace('.', '-w' + queryStr.width + 'h' + queryStr.height + '.');
                    readWriteImage(queryStr.width, queryStr.height);
                } else if (!queryStr.width && queryStr.height) {
                    req.image.opt = '_optimized/' + req.image.orig.replace('.', '-h' + queryStr.height + '.');
                    readWriteImage(queryStr.width, queryStr.height);
                }
            }
        } else if (req.image.isKnown) {
            console.log('Not resizing.');
            sendImage(req.image.orig, false);
        } else {
            res.send(404, 'Request may not be an image. Please check your filetype.');
        }
    })
    .post(function (req, res, next) {
        if (req.image.opt) {
            res.send(req.image.opt);
        }
    });
app.set('port', process.env.port || 3030);
app.listen(app.get('port'), function () {
    console.log('Startin\' this bitch up at port ' + app.get('port'));
});