import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3101;

app.use(express.raw({type: '*/*'}));

app.all('/1', function (req, res) {
    console.log('USER API CALLED', req.headers, req.body.toString());
    res.send()
});

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT ", PORT);
});

