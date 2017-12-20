console.log('start popupScripts.js');
import 'babel-polyfill';
import 'chrome-extension-async';
import $ from 'jquery';
import { ACTIONS } from './constants';

$('#start-screenshots').on('click', async () => {
    let tab = await chrome.tabs.query({active: true});
    await chrome.tabs.sendMessage(tab[0].id, {type: ACTIONS.START_SCREENSHOT});
    window.close();
});
