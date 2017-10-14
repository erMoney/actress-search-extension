console.log('start resultsScripts.js');
import $ from 'jquery';

chrome.runtime.getBackgroundPage((backgroundPage) => {
    let results = backgroundPage.popupResults;
    let id = results.id;
    let name = results[id].name;
    if ( name !== undefined ) {
        displayName(name);
        createAvgleLink(name);
    }
});

const displayName = (name) => {
    $('#main').append(`女優名: ${name}`);
    $('#main').show('slow');
};

const createAvgleLink = (name) => {
    const AVGLE_SEARCH_VIDEOS_API_URL = 'https://api.avgle.com/v1/search/';
    let query = name,
        page = 0,
        limit = '?limit=5'

    $.getJSON(AVGLE_SEARCH_VIDEOS_API_URL + encodeURIComponent(query) + '/' + page + limit, (response) => {
        if (response.success) {
            let videos = response.response.videos;
            createLink(videos);
        }
    });

    const createLink = (videos) => {
        let $videoElement = $('#video')
        for(let video of videos) {
            let temp = `・<a href="${video.video_url}" target="_blank">${video.title}</a><br>`;
            $videoElement.append(temp);
        }
        $videoElement.show('slow');
    };
}
