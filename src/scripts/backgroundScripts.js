console.log('start backgroundScripts.js');
import $ from 'jquery';

const Config = {
    apiEndpoint: 'https://actress-search.herokuapp.com/face:recognition'
}

let popupResults = {}

function cropData(str, coords, tabId, callback)
{
    let img = new Image();

    img.onload = () => {
        let canvas = document.createElement('canvas');
        canvas.width = coords.w;
        canvas.height = coords.h;

        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, coords.x, coords.y, coords.w, coords.h, 0, 0, coords.w, coords.h);

        let base64 = canvas.toDataURL();
        let body = {
            'image': base64.replace(/^.*,/, '')
        };

        $.ajax({
            type: 'POST',
            url: Config.apiEndpoint,
            contentType: 'application/json',
            cache: false,
            data: JSON.stringify(body),
            dataType: 'json'
        })
            .done((response, textStatus, jqXHR) => {
                console.log(response);
                // set popupResults
                popupResults[tabId] = response.face;
                popupResults.id = tabId
                window.popupResults = popupResults;
                // createPopUp
                callback(response);
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR);
            });
    };

    img.src = str;
}

// browserAction
chrome.browserAction.onClicked.addListener(() => {});

chrome.runtime.onMessage.addListener(gotMessage);

function capture(coords, tabId)
{
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (data) => {
        cropData(data, coords, tabId, createPopUp);
    });
}

function createPopUp(response)
{
    const popup_options = {
        url: 'html/results.html',
        focused: false,
        type: 'popup',
        height : 250,
        width : 800
    }
    chrome.windows.create(popup_options, (response) => {});
}

function gotMessage(request, sender, sendResponse)
{
    console.log('gotMessage');
    if (request.type == "coords") {
        capture(request.coords, sender.tab.id);
    }
    sendResponse({});
}

function sendMessage(msg)
{
}
