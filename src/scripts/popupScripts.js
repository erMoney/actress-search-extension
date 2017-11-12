console.log('start popupScripts.js');
import $ from 'jquery';

$('#start-screenshots').on('click', () => {
    let msg = {type: 'start-screenshots'}
    chrome.tabs.query({active: true}, (tab) => {
        chrome.tabs.sendMessage(tab[0].id, msg, (response) => {
            window.close();
        });
    });
});
