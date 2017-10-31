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
    let temp = `<div style="font-family: 'Noto Serif', serif;">女優名: ${name}</div>`;
    $('#main').append(temp);
    $('#main').show('slow');
};

const createAvgleLink = (name) => {
    const AVGLE_SEARCH_VIDEOS_API_URL = 'https://api.avgle.com/v1/search/';
    let query = name,
        page = 0,
        limit = '?limit=6'

    $.getJSON(AVGLE_SEARCH_VIDEOS_API_URL + encodeURIComponent(query) + '/' + page + limit, (response) => {
        console.log(response);
        if (response.success) {
            let videos = response.response.videos;
            createLink(videos);
        }
    });

    const createLink = (videos) => {
        let $videoElement = $('#video')
        let count = 1;
        const MAX = videos.length;
        let temp = '';
        for(let video of videos) {
            if( ( count % 2 ) != 0 ) {
                temp += '<div class="mdl-grid">';
            }
            temp += `
                <div class="mdl-cell mdl-cell--6-col">
                    <div class="cell-video">
                        <video controls>
                            <source src="${video.preview_video_url}" type="video/mp4">
                        </video>
                    </div>
                </div>
            `;
            if (( count % 2 ) == 0 || count == MAX) {
                temp += '</div>';
            }
            count++;
            // let temp = `・<a href="${video.video_url}" target="_blank">${video.title}</a><br>`;
        }
        $videoElement.append(temp);
        $videoElement.show('slow');
    };
}
