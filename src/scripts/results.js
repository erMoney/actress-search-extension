import 'babel-polyfill';
import 'chrome-extension-async';
import $ from 'jquery';
import { AVGLE_SEARCH_VIDEOS_API_URL, ACTIONS } from './constants'

// init
$(async () => {
    const displayName = (name) => {
        let $actressElement = $('#actress-name')
        let temp = `
            <div class="result">
                <div class="text">Search results ... </div>
                <ul class="mdl-list">
                  <li class="mdl-list__item">
                    <span class="mdl-list__item-primary-content">
                        <i class="material-icons mdl-list__item-icon">person</i>
                         ${name}
                    </span>
                  </li>
                </ul>
            </div>
        `;
        $actressElement.append(temp);
        $actressElement.show('slow');
    };

    const createAvgleLink = (name) => {
        let query = name,
            page = 0,
            limit = '?limit=4'

        $.getJSON(AVGLE_SEARCH_VIDEOS_API_URL + encodeURIComponent(query) + '/' + page + limit, (response) => {
            console.log(response);
            if (response.success) {
                let videos = response.response.videos;
                createLink(videos);
            }
        });

        const createLink = (videos) => {
            let $videoElement = $('#actress-video-list')
            let temp = '<div class="mdl-grid">';
            for (let video of videos) {
                temp += `
                    <div class="mdl-cell mdl-cell--4-col">
                        <div class="card_outer">
                            <div class="card_inner">
                                <div class="demo-card-square mdl-card mdl-shadow--2dp">
                                    <div class="mdl-card__title mdl-card--expand" style="background: url(${video.preview_url}) top right / 100% 100% no-repeat #46B6AC"></div>
                                    <div class="mdl-card__supporting-text">${video.title}</div>
                                    <div class="mdl-card__actions mdl-card--border">
                                        <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" href="${video.video_url}" target="_blank">
                                            動画を見る
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            temp += '</div>';
            $videoElement.append(temp);
            $videoElement.show('slow');
        };
    };

    const onMessage = (request, sender, sendResponse) => {
        console.log('Action:', request.type);
        // Next TickでRecieveできないので、先に処理を受け取ったことを返す
        sendResponse();
        switch (request.type) {
            case ACTIONS.SHOW_RESULT:
                const results = request.results;
                const name = results.name;
                if (typeof name !== undefined) {
                    displayName(name);
                    createAvgleLink(name);
                }
                break;
        }
    };
    chrome.runtime.onMessage.addListener(onMessage);
});
