const ndef = require('ndef');

class NdefParser {
    /**
     * Retrieves the value stored in smartTapRedemptionValue
     * 
     * @param {Uint8Array} data The data read from a phone tap
     * @returns An ASCII string containing the smartTapRedemptionValue
     * @throws If the smartTapRedemptionValue wasn't found
     */
    getSmartTapRedemptionValue(data) {
        let smartTapData = null;

        try {
            smartTapData = getSmartTapData(data);
        } catch (error) {
            throw error;
        }

        console.log(smartTapData);
        let ndefRecord = getSmartTapNdefRecord(smartTapData);

        if (ndefRecord == null) {
            throw "NDEF Record not found";
        }

        // The first byte is always empty
        return hexToAscii(bytesToHex(ndefRecord.payload.slice(1)));
    }
}

// To not expose more than getSmartTapRedemptionValue these functions are put outside the class


/**
 * Gets the data received from a SmartTap
 * 
 * @param {Uint8Array} data The data read from a phone tap
 * @throws Throws an error if the tag holding the SmartTap data wasn't found
 */
let getSmartTapData = (data) => {
    const tagNameLength = 3;
    const tagLengthLength = 1;

    // The SmartTap data is found in the tag DFEF76
    let indexDfef76 = getIndexOfSubArray(data, new Uint8Array([0xDF, 0xEF, 0x76]));
    if (indexDfef76 == -1) {
        throw "Tag DFEF76 not found";
    }

    let payloadLength = data[indexDfef76 + tagNameLength];
    let payloadStart = indexDfef76 + tagNameLength + tagLengthLength;

    console.log("payload length", payloadLength, "payload start", payloadStart);
    return data.slice(payloadStart, payloadStart + payloadLength);
}

/**
 * 
 * @param {Uint8Array} data The NDEF structures from the smartTap data
 * @return An NDEF record which holds the smartTapRedemptionValue, or null if not found
 */
let getSmartTapNdefRecord = (data) => {
    var arr = Array.from(data);

    var ndefMessage = ndef.decodeMessage(arr);

    if (ndefMessage.length == 0) {
        return null;
    }

    for (let i = 0; i < ndefMessage.length; i++) {
        var ndefRecord = ndefMessage[i];

        // 0x54 = 84 = T in ASCII
        if (ndefRecord.type == "T") {
            return ndefRecord;
        }
    }

    return getSmartTapNdefRecord(ndefRecord.payload);
}




// Expose an NdefParser object to the window to make it accessible elsewhere
window.ndefParser = new NdefParser();