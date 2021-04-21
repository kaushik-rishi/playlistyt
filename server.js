require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios').default;
const { API_KEY } = process.env;

app.use('/static', express.static(path.join(__dirname, 'static')));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

function isoToSeconds(time) {
    return (
        time.seconds +
        (time.minutes * 60) +
        (time.hours * 60 * 60)
    );
}

function secondsToIso(seconds) {
    seconds = Math.floor(seconds);
    let minutes = 0, hours = 0;
    minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    
    hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    
    return {
        hours,
        minutes,
        seconds
    };
}

function getISODurations(videoDurations) {
    let isoDurations = [];
    for (let duration of videoDurations) {
        duration = duration.slice(2);
        let hrsIndex = duration.indexOf('H'),
            minsIndex = duration.indexOf('M'),
            secsIndex = duration.indexOf('S');
        
        let parsed = {
            hours: 0,
            minutes: 0,
            seconds: 0
        };
        
        parsed.hours = timeSlotValue(duration, hrsIndex);
        parsed.minutes = timeSlotValue(duration, minsIndex);
        parsed.seconds = timeSlotValue(duration, secsIndex);
        isoDurations.push(parsed);
    }
    return isoDurations;
}

function timeSlotValue(duration, index) {
    let number = '';
    index--;
    while (index >= 0 && (!isNaN(+duration[index]))) {
        number = duration[index--] + number;
    }
    return +number;
}

async function getAllDurations(playlistId) {
    let maxResults = 50,
     videoIds = [],
     videoDurations = [],
     response = {},
     nextPageToken = undefined,
     firstRequest = true;
    
    while (firstRequest || nextPageToken) {
        response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
            params: {
                key: API_KEY,
                maxResults: maxResults,
                part: 'contentDetails',
                playlistId: playlistId,
                pageToken: nextPageToken
            }
        });
        
        const { data } = response;
        nextPageToken = data.nextPageToken;
        
        for (let video of data.items)  {
            let { videoId } = video.contentDetails;
            const videoResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                params: {
                    key: API_KEY,
                    id: videoId,
                    part: 'contentDetails'
                }
            });
            const { data: videoData } = videoResponse;
            if (videoData.items && videoData.items[0] && videoData.items[0].contentDetails && videoData.items[0].contentDetails.duration) {
                videoDurations.push(videoData.items[0].contentDetails.duration);
            }
            
            videoIds.push(videoId);
        }
        
        firstRequest = false;
    }
    
    return getISODurations(videoDurations);
}

function rawSumISO(isoDurations) {
    return isoDurations.reduce((accumulator, currentValue) => {
        return {
            hours: accumulator.hours + currentValue.hours,
            minutes: accumulator.minutes + currentValue.minutes,
            seconds: accumulator.seconds + currentValue.seconds
        }; 
    }, {
        hours: 0,
        minutes: 0,
        seconds: 0
    });
}

// this route hits the youtube API and returns the data to the server
app.post('/playlist', async (req, res) => {
    const playlistId = req.body.playlistId;
    
    const isoDurations = await getAllDurations(playlistId);
    const videoCount = isoDurations.length;
    
    const totalSeconds = isoToSeconds(rawSumISO(isoDurations));
    const totalISODuration = secondsToIso(totalSeconds);
    const averageDuration = secondsToIso(totalSeconds / videoCount);
    const speed = {};
    let speedLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    for (let speedLevel of speedLevels) {
        speed[speedLevel + 'x'] = secondsToIso(totalSeconds/speedLevel);
    }
    
    res.json({
        totalDuration: totalISODuration,
        averageDuration,
        videoCount,
        speed
    })
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`server running on port ${PORT}`));