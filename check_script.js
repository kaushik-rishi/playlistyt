const axios = require('axios').default;

async function task() {
    let resp = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
            key: 'AIzaSyAxb0jMTPf2bG0BpjUKjmM7Z8E9TeZml_E',
            part: 'contentDetails',
            id: ['nF9g1825mwk', '5D67Qy1tPLY', '0iSICdbDIYI'].join()
            // id: 'nF9g1825mwk'
        }
    });
    console.log(resp.data);
}

task();