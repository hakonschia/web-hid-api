/**
 * Converts a hex string to a Uint8Array
 * 
 * Taken from: https://stackoverflow.com/a/34356351
 * 
 * @param {*} bytes 
 */
function hexToBytes(hex) {
    var bytes = new Uint8Array(hex.length / 2);

    for (var c = 0; c < hex.length; c += 2) {
        bytes[c / 2] = parseInt(hex.substr(c, 2), 16);
    }

    return bytes;
}

/**
 * Converts a byte array to a hex string
 * 
 * Taken from: https://stackoverflow.com/a/34356351
 * 
 * @param {*} bytes 
 */
function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xF).toString(16));
    }
    return hex.join("");
}

function intToByteArray(int) {
    let arr = [];

    for (; int > 0; int -= 0xFF) {
        arr.push(int % 256);
    }

    return arr;
}

/**
 * Left pads an array with a given value
 * 
 * @param {array} array 
 * @param {any} value 
 * @param {number} length 
 */
function leftPad(array, value, length) {
    if (array.length >= length) {
        return array;
    }

    return new Array(length - array.length).fill(value).concat(array);
}