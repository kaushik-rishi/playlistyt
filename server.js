require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const validator = require('validator');

const {
    isoToSeconds,
    secondsToIso,
    rawSumISO,
    getISODurations
} = require('./utils/time');

const { getAllDurations } = require('./utils/api');
const { default: axios } = require('axios');

app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/', express.static(path.join(__dirname, 'frontend')));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// this route hits the youtube API and returns the data to the server
app.post('/playlist', async (req, res) => {
    let playlistId = req.body.playlistId;
    
    if (validator.isURL(playlistId)) {
        playlistId = playlistId.split('?').pop();
        let params = playlistId.split('&');
        
        for (let param of params) 
            if (param.startsWith('list=')) 
                playlistId = param.slice(5);
    }

    let playlistName;
    try {
        const playlistResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
            params: {
                key: process.env.API_KEY,
                id: playlistId,
                part: 'snippet'
            }
        });
        const playlistData = playlistResponse.data['items'];
        playlistName = playlistData[0].snippet.title;
        if (!playlistData.length) {
            return res.json({
                ok: false,
                msg: 'Not a valid playlist id (or insufficient authorization)'
            });
        }
    } catch (e) {
        console.log(e.message);
    }
    
    try {
        const isoDurations = getISODurations(await getAllDurations(playlistId));
        const videoCount = isoDurations.length;
        
        const totalSeconds = isoToSeconds(rawSumISO(isoDurations));
        const totalISODuration = secondsToIso(totalSeconds);
        const averageDuration = secondsToIso(totalSeconds / videoCount);
        const speed = {};
        let speedLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

        for (let speedLevel of speedLevels) 
            speed[speedLevel + 'x'] = secondsToIso(totalSeconds/speedLevel);

        return res.json({
            playlistName,
            ok: true,
            totalDuration: totalISODuration,
            averageDuration,
            videoCount,
            speed
        });
    } catch (e) {
        console.log(e.message);
        return res.json({
            ok: false,
            msg: 'Something went wrong on the server. Please try later'
        });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`server running on port ${PORT}`));