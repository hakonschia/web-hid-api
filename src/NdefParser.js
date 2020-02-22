import { hexToAscii, bytesToHex, getIndexOfSubArray } from './util';
import { SERVICE_TYPE, SERVICE_TYPES } from './constants';
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

        // If the service tipe is set to "all" it introduces a "compound/speical" byte between
        // the smartTap tag tagname and taglength. Only tested for service types "all" and "loyalty"
        const specialByteLength = (SERVICE_TYPE === SERVICE_TYPES.all ? 1 : 0);
        const tagLengthLength = 1;

        // The SmartTap data is found in the tag DFEF76
        let indexDfef76 = getIndexOfSubArray(data, new Uint8Array([0xDF, 0xEF, 0x76]));
        if (indexDfef76 === -1) {
            throw new InvalidTapDataException("Tag DFEF76 not found");
        }

        let payloadLength = data[indexDfef76 + specialByteLength + tagNameLength];
        let payloadStart = indexDfef76 + specialByteLength + tagNameLength + tagLengthLength;

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
        console.log(ndefMessage.length)

        for (let i = 0; i < ndefMessage.length; i++) {
            let ndefRecord = ndefMessage[i];

            console.log(ndefRecord);
            // NOTE: The correct record being in the type 0x54 is a heavy assumption which is not
            // always correct, but without signing an NDA with Google it's the best we can do
            // It seems that even though there migth be multiple 0x54 types, the ID is 0x6E only
            // in the correct record

            // 0x54 = 84 = T in ASCII
            if (ndefRecord.type === "T" && ndefRecord.id == 0x6E) {
                return ndefRecord;
            }


            // TODO Issues:
            // This only works if the last record is a new message
            // This doesn't seem to be an issue if SERVICE_TYPE is set to loyaltyOnly
            // but should be looked at

            // This works:
            // message
            //      record
            //      record
            //      message
            //          record

            // This doesn't work, it doesn't get to the third message
            // message
            //      record
            //      record
            //      message
            //          record
            // message
            // .....

            var msg = ndef.decodeMessage(ndefRecord.payload);

            // decodeMessage sometimes gives back a record with an empty payload for some reason            
            if (msg.length > 0 && msg[0].payload.length > 0) {
                return this.getSmartTapNdefRecord(ndefRecord.payload);
            }
        }
    }

}