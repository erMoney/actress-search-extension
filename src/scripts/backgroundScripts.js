console.log('start backgroundScripts.js');
import $ from 'jquery';
import 'tracking/build/data/face';

let popupResults = {};
const apiEndpoint = 'https://actress-search.herokuapp.com/face:recognition';

function consoleImage(src)
{
    console.log('%c       ', 'font-size: 100px; background: url('+src+') no-repeat; background-size:contain;');
}

function promiseImage(src)
{
    return new Promise((resolve) => {
        let img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.src = src;
    });
}

function cropImage(src, coords)
{
    return promiseImage(src)
    .then((img) => {
        let canvasObj = document.createElement('canvas');
        canvasObj.width = coords.w;
        canvasObj.height = coords.h;

        let ctx = canvasObj.getContext('2d');
        ctx.drawImage(img, coords.x, coords.y, coords.w, coords.h, 0, 0, coords.w, coords.h);
        return canvasObj.toDataURL();
    });
}

function faceDetect(src)
{
    console.log('faceDetect');
    consoleImage(src);

    return promiseImage(src)
    .then((img) => {
        $('body').append(img);
        $(img).attr('id', 'trackingImage');

        const tracker = new tracking.ObjectTracker('face');
        tracker.setInitialScale(4);
        tracker.setStepSize(2);
        tracker.setEdgesDensity(0.1);
        tracking.track('#trackingImage', tracker);

        return new Promise((resolve, reject) => {
            tracker.on('track', (event) => {
                console.log(event);
                $(img).remove();

                if(event.data.length == 0) {
                    reject(new Error('Face is not detected.'));
                    return;
                }
                resolve(img.src);
            });
        });
    });
}

function faceRecognize(src)
{
    return new Promise((resolve, reject) => {
        let body = {
            'image': src.replace(/^.*,/, '')
        };
        $.ajax({
            type: 'POST',
            url: apiEndpoint,
            contentType: 'application/json',
            cache: false,
            data: JSON.stringify(body),
            dataType: 'json'
        })
        .done((res, textStatus, jqXHR) => {
            console.log(res);
            resolve(res.face);
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            reject(new Error('Face is not recognized.'));
        });
    });
}

chrome.browserAction.onClicked.addListener(() => {});
chrome.runtime.onMessage.addListener(gotMessage);

function capture(coords, tabId)
{
    class CaptureFilter {
        constructor(threshold) {
            this.threshold = threshold || 10;
            this.previousSrc = null;
            this.unchangedCount = 0;
        }
        filter(currentSrc) {
             if (!this.previousSrc || this.previousSrc !== currentSrc) {
                this.previousSrc = currentSrc;
                this.unchangedCount = 0;
                return Promise.resolve(currentSrc);
            } else if (this.unchangedCount < this.threshold) {
                this.previousSrc = currentSrc;
                this.unchangedCount += 1;
                return Promise.resolve(currentSrc);
            } else {
                this.previousSrc = currentSrc;
                this.unchangedCount += 1;
                return Promise.reject(new Error('Capture is not changed.'));
            }
        }
    }

    let captureFilter = new CaptureFilter();

    const run = () => {
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, (data) => {
            cropImage(data, coords)
            .then(captureFilter.filter.bind(captureFilter))
            .then(faceDetect)
            .then(faceRecognize)
            .then(function (face) {
                console.log("Success to detect actress", face);
                popupResults[tabId] = face;
                popupResults.id = tabId
                window.popupResults = popupResults;
                createPopUp();
            }).catch((err) => {
                console.log(err);
                setTimeout(run, 1000);
            });
        });
    };
    run();
}

function createPopUp()
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

function sendMessage(msg) {}
