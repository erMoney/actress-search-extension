import 'babel-polyfill';
import 'chrome-extension-async';
import $ from 'jquery';
import { ACTIONS } from './constants';

$(async () => {
    await chrome.runtime.sendMessage({type: ACTIONS.STOP_PROCESS});
    
    $('#start_screenshots').on('click', async () => {
        await chrome.runtime.sendMessage({type: ACTIONS.START_SCREENSHOT});
        window.close();
    });
});

