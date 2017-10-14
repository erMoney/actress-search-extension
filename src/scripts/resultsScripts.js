console.log('start resultsScripts.js');
import $ from 'jquery';

chrome.runtime.getBackgroundPage((backgroundPage) => {
    let results = backgroundPage.popupResults;
    let id = results.id;
    let name = results[id].name;
    if ( name !== undefined ) {
        displayName(name);
    }
});

const displayName = (name) => {
    $('#main').append(name);
};
