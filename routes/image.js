exports.image = function (req, res) {
    var queryStr = req.query,
        i,
        key,
        queryArr = [];
    if (queryStr) {
        for (key in queryStr) {
            queryArr.push(key + ': ' + queryStr[key]);
            // console.log(req.query);
        }
    } else {
        res.send('<h1>Hi there!</h1>');
    }
};