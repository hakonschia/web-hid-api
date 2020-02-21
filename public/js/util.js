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

/**
 * Converts an int to a byte array
 * 
 * Taken from, with some modifications: https://stackoverflow.com/a/12965194
 * 
 * @param {integer} int The int to convert
 * @returns A Uint8Array representation of the int given
 */
function intToByteArray(int) {
    let arr = [];

    while (int > 0) {
        let byte = int & 0xFF;

        arr.push(byte);

        int = (int - byte) / 256;
    }

    return new Uint8Array(arr);
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

/**
 * Checks if the last element in an array is blank
 * 
 * @param {array} array 
 */
let lastBlank = (array) => {
    return array[array.length - 1] == 0;
}

/**
 * Trims the end of an array by removing all the last elements
 * that match a given value
 * 
 * @param {array} array The array to remove from
 * @param {*} value The value to trim for
 * @returns A new array with the end trimmed. If no elements are removed the
 * original array is returned untouched
 */
let trimEnd = (array, value) => {
    let index = -1;

    let i = array.length - 1;
    let found = false;

    while (!found && i >= 0) {
        if (array[i] != value) {
            index = i + 1;
        }

        found = (index != -1);
        i--;
    }

    return index == -1 ? array : array.slice(0, index);
}