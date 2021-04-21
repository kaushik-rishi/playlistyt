const axios = require('axios').default;

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
                key: process.env.API_KEY,
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
                    key: process.env.API_KEY,
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
    
    return videoDurations;
}

module.exports = {
    getAllDurations
};