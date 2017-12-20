console.log('start popupScripts.js');
import { ACTIONS } from 'constants';
import $ from 'jquery';

$('#start-screenshots').on('click', () => {
    let msg = {type: ACTIONS.START_SCREENSHOT}
    chrome.tabs.query({active: true}, (tab) => {
        chrome.tabs.sendMessage(tab[0].id, msg, (response) => {
            window.close();
        });
    });
});
