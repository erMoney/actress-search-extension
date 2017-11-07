console.log('start backgroundScripts.js');
import $ from 'jquery';
import 'tracking/build/data/face';

let popupResults = {}
const apiEndpoint = 'https://actress-search.herokuapp.com/face:recognition';

function cropData(str, coords, tabId, callback)
{
    let img = new Image();

    img.onload = () => {
        let canvasObj = document.createElement('canvas');
        canvasObj.width = coords.w;
        canvasObj.height = coords.h;

        let ctx = canvasObj.getContext('2d');
        ctx.drawImage(img, coords.x, coords.y, coords.w, coords.h, 0, 0, coords.w, coords.h);

        // create base64 image
        let base64img = canvasObj.toDataURL();

        // create image element
        let bodyObj = document.getElementsByTagName('body').item(0);
        let cropImgObj = document.createElement('img');
        cropImgObj.setAttribute('id','trackingImage');
        cropImgObj.width = coords.w;
        cropImgObj.height = coords.h;
        cropImgObj.src = base64img;
        bodyObj.appendChild(cropImgObj);
        const cropImgObjOnload = () => {
            return new Promise((resolve) => {
                cropImgObj.onload = () => {
                    resolve();
                }
            });
        }

        cropImgObjOnload()
            .then(() => {
                // detect init
                const tracker = new tracking.ObjectTracker('face');
                tracker.setInitialScale(4);
                tracker.setStepSize(2);
                tracker.setEdgesDensity(0.1);
                tracking.track('#trackingImage', tracker);
                // detect start
                tracker.on('track', (event) => {
                    console.log(event);
                    // clear image element
                    if (document.querySelector('#trackingImage') != null) {
                        document.querySelector('#trackingImage').remove();
                    }
                    if(event.data.length > 0) {
                        let body = {
                            'image': base64img.replace(/^.*,/, '')
                        };
                        $.ajax({
                            type: 'POST',
                            url: apiEndpoint,
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
                    } else {
                        console.log('not detection.');
                    }
                });
            })
    };

    img.src = str;
}

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
        height : 650,
        width : 900
    }
    chrome.windows.create(popup_options, (response) => {});
}

function gotMessage(request, sender, sendResponse)
{
    console.log('gotMessage');
    if (request.type == 'coords') {
        capture(request.coords, sender.tab.id);
    }
    sendResponse({});
}

function sendMessage(msg)
{
}
