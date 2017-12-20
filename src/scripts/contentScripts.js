console.log('start contentScripts.js');
import 'babel-polyfill';
import 'chrome-extension-async';
import $ from 'jquery';
import { ACTIONS } from './constants'

// init
$(async () => {
    chrome.runtime.onMessage.addListener(gotMessage);
});

const gotMessage = (request, sender, sendResponse) => {
    console.log('gotMessage');
    if (request.type == ACTIONS.START_SCREENSHOT) {
        startScreenshot();
    }
    sendResponse({});
};

const startScreenshot = () => {
    document.addEventListener('mousedown', mouseDown, false);
    document.addEventListener('keydown', keyDown, false);
};

const endScreenshot = async (coords) => {
    document.removeEventListener('mousedown', mouseDown, false);
    await sendMessage({type: 'coords', coords: coords});
};

const sendMessage = async (msg) => {
    await chrome.runtime.sendMessage(msg);
};


const WINDOW_RATIO = window.devicePixelRatio
let ghostElement,
    startPos,
    gCoords

const keyDown = async (e) => {
    let keyCode = e.keyCode;

    // Hit: n
    if (keyCode == '78' && gCoords) {
        e.preventDefault();
        e.stopPropagation();

        if (gCoords.w > 0 && gCoords.h > 0) {
            await endScreenshot(coords);
        }

        return false;
    }
};

const mouseDown = (e) => {
    e.preventDefault();

    startPos = {x: e.pageX, y: e.clientY};

    ghostElement = document.createElement('div');
    ghostElement.style.backgroundColor = '#ff4081';
    ghostElement.style.opacity = '0.1';
    ghostElement.style.position = 'absolute';
    ghostElement.style.left = e.pageX + 'px';
    ghostElement.style.top = e.clientY + 'px';
    ghostElement.style.width = '0px';
    ghostElement.style.height = '0px';
    ghostElement.style.zIndex = '1000000';
    document.body.appendChild(ghostElement);

    document.addEventListener('mousemove', mouseMove, false);
    document.addEventListener('mouseup', mouseUp, false);

    return false;
};

const mouseMove = (e) => {
    e.preventDefault();

    let nowPos = {x: e.pageX, y: e.clientY};
    let diff = {x: nowPos.x - startPos.x, y: nowPos.y - startPos.y};

    ghostElement.style.width = diff.x + 'px';
    ghostElement.style.height = diff.y + 'px';

    return false;
};

const mouseUp = (e) => {
    e.preventDefault();

    let nowPos = {x: e.pageX, y: e.clientY};
    let diff = {x: nowPos.x - startPos.x, y: nowPos.y - startPos.y};

    document.removeEventListener('mousemove', mouseMove, false);
    document.removeEventListener('mouseup', mouseUp, false);

    ghostElement.parentNode.removeChild(ghostElement);

    setTimeout(() => {
        let coords = {
            w: diff.x * WINDOW_RATIO,
            h: diff.y * WINDOW_RATIO,
            x: startPos.x * WINDOW_RATIO,
            y: startPos.y * WINDOW_RATIO
        };
        gCoords = coords;
        if (gCoords.w > 0 && gCoords.h > 0) {
            endScreenshot(coords);
        }
    }, 50);

    return false;
};
