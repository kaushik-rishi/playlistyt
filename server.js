require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');

const {
    isoToSeconds,
    secondsToIso,
    rawSumISO,
    getISODurations
} = require('./utils/time');

const { getAllDurations } = require('./utils/api');

app.use('/static', express.static(path.join(__dirname, 'static')));
app.set('view engine', 'ejs');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

// this route hits the youtube API and returns the data to the server
app.post('/playlist', async (req, res) => {
    console.log(req.body);
    const playlistId = req.body.playlistId;
    
    const isoDurations = getISODurations(await getAllDurations(playlistId));
    const videoCount = isoDurations.length;
    
    const totalSeconds = isoToSeconds(rawSumISO(isoDurations));
    const totalISODuration = secondsToIso(totalSeconds);
    const averageDuration = secondsToIso(totalSeconds / videoCount);
    const speed = {};
    let speedLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    for (let speedLevel of speedLevels) 
        speed[speedLevel + 'x'] = secondsToIso(totalSeconds/speedLevel);
    
    res.json({
        totalDuration: totalISODuration,
        averageDuration,
        videoCount,
        speed
    })
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`server running on port ${PORT}`));