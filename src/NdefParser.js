import { hexToAscii, bytesToHex, getIndexOfSubArray } from './util';
import InvalidTapDataException from './exceptions/InvalidTapDataException';
const ndef = require('ndef');

export default class NdefParser {
    /**
     * Retrieves the value stored in smartTapRedemptionValue
     * 
     * @param {Uint8Array} data The data read from a phone tap
     * @returns An ASCII string containing the smartTapRedemptionValue
     * @throws If the smartTapRedemptionValue wasn't found
     */
    static getSmartTapRedemptionValue(data) {
        let smartTapData = null;

        try {
            smartTapData = this.getSmartTapData(data);
        } catch (error) {
            throw error;
        }

        let ndefRecord = this.getSmartTapNdefRecord(smartTapData);

        if (ndefRecord == null) {
            throw new InvalidTapDataException("NDEF Record not found");
        }

        // The first byte is always empty
        return hexToAscii(bytesToHex(ndefRecord.payload.slice(1)));
    }

    /**
     * Gets the data received from a SmartTap
     * 
     * @param {Uint8Array} data The data read from a phone tap
     * @throws Throws an error if the tag holding the SmartTap data wasn't found
     */
    static getSmartTapData = (data) => {
        const tagNameLength = 3;
        const tagLengthLength = 1;

        // The SmartTap data is found in the tag DFEF76
        let indexDfef76 = getIndexOfSubArray(data, new Uint8Array([0xDF, 0xEF, 0x76]));
        if (indexDfef76 === -1) {
            throw new InvalidTapDataException("Tag DFEF76 not found");
        }

        let payloadLength = data[indexDfef76 + tagNameLength];
        let payloadStart = indexDfef76 + tagNameLength + tagLengthLength;

        return data.slice(payloadStart, payloadStart + payloadLength);
    }


    /**
     * 
     * @param {Uint8Array} data The NDEF structures from the smartTap data
     * @return An NDEF record which holds the smartTapRedemptionValue, or null if not found
     */
    static getSmartTapNdefRecord = (data) => {
        // decodeMessage expects a standard array
        let arr = Array.from(data);

        let ndefMessage = ndef.decodeMessage(arr);

        for (let i = 0; i < ndefMessage.length; i++) {
            let ndefRecord = ndefMessage[i];

            // 0x54 = 84 = T in ASCII
            if (ndefRecord.type === "T") {
                return ndefRecord;
            }

            var msg = ndef.decodeMessage(ndefRecord.payload);

            // decodeMessage sometimes gives back a record with an empty payload for some reason            
            if (msg.length > 0 && msg[0].payload.length > 0) {
                return this.getSmartTapNdefRecord(ndefRecord.payload);
            }
        }

        return null;
    }

}