import 'babel-polyfill';
import 'chrome-extension-async';
import $ from 'jquery';
import uuidv4 from 'uuid/v4';
import 'tracking/build/data/face';
import { API_ENDPOINT, ACTIONS, STATUS } from './constants';

(() => {
    'use strict';
    
    let currentProcessId = null;
    
    class LoadingDialog {
        constructor() {
            this.angle = 0;
            this.intervalId = null;
        }
        
        show() {
            if (!!this.intervalId) {
                // already show
                return;
            }
            
            this.intervalId = setInterval(() => {
                let nextAngle = (this.angle + 90) % 360;
                chrome.browserAction.setIcon({ path: `/icons/load-${nextAngle}.png` });
                this.angle = nextAngle;
            }, 1000);
        }
        
        dismiss() {
            if (!!this.intervalId) {
                clearInterval(this.intervalId);
            }
            chrome.browserAction.setIcon({ path: `/icons/16.png` });
            this.intervalId = null;
        }
    }
    
    const loadingDialog = new LoadingDialog();
    
    const consoleImage = (src) => {
        console.log('%c       ', 'font-size: 100px; background: url(' + src + ') no-repeat; background-size:contain;');
    };
    
    const newImage = (src) => {
        return new Promise((resolve) => {
            let img = new Image();
            img.onload = () => {
                resolve(img);
            };
            img.src = src;
        });
    };
    
    const cropImage = async (src, coords) =>{
        let img = await newImage(src);
        let canvasObj = document.createElement('canvas');
        canvasObj.width = coords.w;
        canvasObj.height = coords.h;
        
        let ctx = canvasObj.getContext('2d');
        ctx.drawImage(img, coords.x, coords.y, coords.w, coords.h, 0, 0, coords.w, coords.h);
        return canvasObj.toDataURL();
    };
    
    const faceDetect = async (src) => {
        console.log('faceDetect');
        consoleImage(src);
        
        let img = await newImage(src);
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
                
                if (event.data.length === 0) {
                    reject(new Error('Face is not detected.'));
                    return;
                }
                resolve(img.src);
            });
        });
    };
    
    const faceRecognize = async (src) => {
        return new Promise((resolve, reject) => {
            let body = {
                'image': src.replace(/^.*,/, '')
            };
            $.ajax({
                type: 'POST',
                url: API_ENDPOINT,
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
    };
    
    const getCurrentTab = async () => {
        let tabs = await chrome.tabs.query({active: true});
        return tabs[0];
    };
    
    const getCoords = async () => {
        let currentTab = await getCurrentTab();
        await chrome.tabs.sendMessage(currentTab.id, {type: ACTIONS.GET_COORDS});
    };
    
    const getScreenShot = async (tab, coords) => {
        let windowId = tab.windowId;
        let data = await chrome.tabs.captureVisibleTab(windowId, {format: 'png'});
        return cropImage(data, coords);
    };
    
    const showResultPopup = async (results) => {
        console.log(results);
        let window = await chrome.windows.create({
            url: 'html/results.html',
            focused: false,
            type: 'popup',
            height: 650,
            width: 900
        });
        let tab = window.tabs[0];
        chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
            if (tab.id === tabId && changeInfo.status === "complete") {
                await chrome.tabs.sendMessage(tab.id, {type: ACTIONS.SHOW_RESULT, results: results});
            }
        });
    };
    
    const doRecognizeProcess = async (tab, coords) => {
        const processId = uuidv4();
        currentProcessId = processId;
        loadingDialog.show();
        
        // MEMO: 10回まわしてダメなら、おしまい
        for (let i = 0; i < 10 && (currentProcessId === processId); i++) {
            try {
                let screenShot = await getScreenShot(tab, coords);
                consoleImage(screenShot);
                let results = await faceRecognize(screenShot);
    
                // ProcessIdが変わっていたら処理しない
                if (currentProcessId === processId) {
                    await showResultPopup(results);
                }
                break;
            } catch (err) {
                console.error(err);
            }
        }
        
        // ProcessIdが変わっていたら処理しない
        if (currentProcessId === processId) {
            currentProcessId = null;
            loadingDialog.dismiss();
        }
    };
    
    const onMessage = async (request, sender, sendResponse) => {
        console.log('Action:', request.type);
        sendResponse();
        switch (request.type) {
            case ACTIONS.STOP_PROCESS:
                currentProcessId = null;
                loadingDialog.dismiss();
                break;
            case ACTIONS.START_SCREENSHOT:
                sendResponse();
                await getCoords();
                break;
            case ACTIONS.RECOGNIZE_FACE:
                let tab = sender.tab;
                let coords = request.coords;
                await doRecognizeProcess(tab, coords);
                break;
        }
    };
    
    chrome.runtime.onMessage.addListener(onMessage);
})();
