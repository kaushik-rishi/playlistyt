const form = document.querySelector('form#playlist-form');
const loading = document.querySelector('#loading');
const content = document.querySelector('#content');

const baseUrl = '/playlist';

form.addEventListener('submit', getPlaylistInfo);

function durationToWords(duration) {
    let durationString = '';
    if (duration.hours) durationString += `${duration.hours} hours `
    if (duration.minutes) durationString += `${duration.minutes} minutes `
    if (duration.seconds) durationString += `${duration.seconds} seconds `
    
    return durationString;
}

async function getPlaylistInfo(e) {
    e.preventDefault();
    content.innerHTML = '';
    toggleLoading();
    
    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playlistId: form.playlistid.value
            })  
        });
        
        const data = await response.json();
        let message = `<h3><b>Playlist name: </b> ${data.playlistName}</h3><br><b>Total videos:</b> ${data.videoCount}<br><b>Total duration of all videos</b>: ${durationToWords(data.totalDuration)}<br><b>Average duration of a video</b>: ${durationToWords(data.averageDuration)}<br>`;
        for (let speed of Object.keys(data.speed)) 
            message += `<b>At a speed ${speed} :</b> ${durationToWords(data.speed[speed])}<br>`;
    
        content.innerHTML = message;
    } catch (err) {
        console.error(err.message);
        content.innerHTML = `<p>Sorry! Please check the link again</p>`;
    }
    
    toggleLoading();
}

function toggleLoading() {
    if (loading.classList.contains('hidden')) loading.classList.remove('hidden');
    else loading.classList.add('hidden');
}