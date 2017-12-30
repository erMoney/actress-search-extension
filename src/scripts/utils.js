const consoleImage = (src) => {
    console.log('%c       ', 'font-size: 100px; background: url(' + src + ') no-repeat; background-size:contain;');
};

const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
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

module.exports = {
    consoleImage,
    timeout,
    newImage,
};