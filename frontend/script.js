const form = document.querySelector('form#playlist-form');
const loading = document.querySelector('#loading');
const content = document.querySelector('#content');

const baseUrl = 'https://playlistyt.herokuapp.com/playlist';

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
    let message = `<b>Total videos</b>: ${data.videoCount}<br><b>Total duration of all videos</b>: ${durationToWords(data.totalDuration)}<br><b>Average duration of a video</b>: ${durationToWords(data.averageDuration)}<br>`;
    for (let speed of Object.keys(data.speed)) 
        message += `<b>At a speed ${speed} :</b> ${durationToWords(data.speed[speed])}<br>`;

    console.log(message);
    content.innerHTML = message;
    
    toggleLoading();
}

function toggleLoading() {
    loading.classList.toggle('hidden');
}