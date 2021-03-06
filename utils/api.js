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
            videoIds.push(videoId);
        }
        
        firstRequest = false;
    }
    
    let index = 0;
    while (index < videoIds.length) {
        let videosResp = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params:{
                key: process.env.API_KEY,
                id: videoIds.slice(index, index + 50).join(),
                part: 'contentDetails'
            }
        });
        
        const {data: videoData} = videosResp;
        for (let video of videoData?.items) {
            if (! (video.contentDetails && video.contentDetails.duration) ) continue;
            videoDurations.push(video.contentDetails.duration);
        }
        
        index += 50;
    }
       
    return videoDurations;
}

module.exports = {
    getAllDurations
};