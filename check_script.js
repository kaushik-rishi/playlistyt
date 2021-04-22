// const axios = require('axios').default;

// async function task() {
//     let resp = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
//         params: {
//             key: 'AIzaSyAxb0jMTPf2bG0BpjUKjmM7Z8E9TeZml_E',
//             part: 'contentDetails',
//             id: ['nF9g1825mwk', '5D67Qy1tPLY', '0iSICdbDIYI'].join()
//             // id: 'nF9g1825mwk'
//         }
//     });
//     console.log(resp.data);
// }

// task();

const validator = require('validator');

let playlistId = 'https://www.youtube.com/watch?v=UXZn7DASlaU&list=PLsk-JSY3yILVq9bX3g1Ck1QheQxKsB5yN&index=1';
if (validator.isURL(playlistId)) {
    playlistId = playlistId.split('?').pop();
    let params = playlistId.slice(1).split('&');
    
    for (let param of params) 
        if (param.startsWith('list=')) 
            console.log(param.slice(5));
}