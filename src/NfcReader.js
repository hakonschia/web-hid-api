import { VIVOPAY_2_HEADER } from './constants';
import { leftPad, intToByteArray, trimEnd, arraysEqual } from './util';
import CrcCalculator from './CrcCalculator';
import ReaderNotConnectedException from './exceptions/ReaderNotConnectedException';
var DeviceState = require('./DeviceState').default;

export default class NfcReader {

    /**
     * Creates a new device
     * 
     * Use NfcReader.connect() to connect to the device
     * 
     * @param {HIDDevice} device The HIDDevice returned from hid.getDevices() or hid.requestDevice()
     */
    constructor(device = null) {
        this.device = device;
        this.inputReportData = new Uint8Array();
    }

    /**
     * Connects to the device
     * 
     * @param {function} callback The callback should look like: callback(connected)
     * If connceting to the device was successfull, connected will be true
     */
    connect(callback) {
        this.device.open().then(() => {
            console.log("Device opened");

            this.device.oninputreport = this.onInputReport;
            callback(true);
        }).catch(error => {
            callback(false);
        });
    }

    /**
     * Sets the callback function to use when a reader event has happened
     * 
     * @param {function} callback The callback should look like: callback(Uint8Array data, DeviceState state)
     * The data holds the data sent/received from the reader. The state identifies what kind of event happened
     */
    setCallback = (callback) => {
        this.readerCallback = callback;
    }

    /**
     * Pings the device
     * 
     * @throws Throws a ReaderNotConnected exception if the reader is not connected
     */
    ping = () => {
        // The ping command takes no payload
        try {
            this.sendCommand(0x18, 0x01, []);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Sends a command to the reader to activate the transaction
     * 
     * @param {Uint8Array} data The command data
     * @throws Throws a ReaderNotConnected exception if the reader is not connected
     */
    activateTransaction = (data) => {
        try {
            this.sendCommand(0x02, 0x40, data);
        } catch (error) {
            throw error;
        }
    }


    /**
     * Sends a command to the reader
     * 
     * @param {octet} command 
     * @param {octet} subCommand 
     * @param {Uint8Array} data The command data
     * 
     * @throws Throws an exception if the reader is not connected or has not yet been opened
     */
    sendCommand = (command, subCommand, data) => {
        if (!this.device || !this.device.opened) {
            console.warn("Trying to use unconnected or unopened device");

            throw new ReaderNotConnectedException("Reader is not connected or has not yet been opened");
        }

        data = this.buildCommand(command, subCommand, data);

        this.device.sendReport(0x01, data);

        if (this.readerCallback != null) {
            this.readerCallback(data, DeviceState.DataSent);
        } else {
            console.warn("No reader callback set");
        }
    }

    /**
     * Builds the command to send to the reader based on the parameters given
     * 
     * @param {octet} command The command to use
     * @param {octet} subCommand The subcommand to use
     * @param {Uint8Array} baseData The command data
     */
    buildCommand = (command, subCommand, baseData) => {
        const headerLength = VIVOPAY_2_HEADER.length;
        const commandLength = 1;
        const subCommandLength = 1;
        const dataLengthLength = 2;
        const CRCLength = 2;

        let dataLength = baseData.length;
        let dataLengthAsByteArray = leftPad(intToByteArray(dataLength), 0, dataLengthLength);

        // Data is structured as:
        // HEADER - COMMAND (1 byte) - SUBCOMMAND (1 byte) - DATA LENGTH (2 bytes) - DATA - CRC (2 bytes)
        let length = headerLength + commandLength + subCommandLength + dataLengthLength + dataLength + CRCLength;
        let data = new Uint8Array(length);

        let offset = 0;

        data.set(VIVOPAY_2_HEADER, offset);
        offset += headerLength;

        data.set([command], offset);
        offset += commandLength;

        data.set([subCommand], offset);
        offset += subCommandLength;

        data.set(dataLengthAsByteArray, offset);
        offset += dataLengthLength;

        data.set(baseData, offset);
        offset += dataLength;

        let crc = CrcCalculator.crc16(data.slice(0, data.length - CRCLength));
        crc = leftPad(crc, 0, CRCLength);

        data.set(crc, offset);

        return data;
    }

    /**
     * Called when the reader has sent data back to the application
     * 
     * If the callback is set, it is automatically called
     * 
     * @param {HIDInputReportEvent} e The event data
     */
    onInputReport = (e) => {
        let data = new Uint8Array(e.data.buffer);

        // The data returned is always of a fixed size, which means "one" response can come in multiple "packets"

        let newData = new Uint8Array(this.inputReportData.length + data.length);
        newData.set(this.inputReportData);
        newData.set(data, this.inputReportData.length);

        this.inputReportData = newData;

        let trimmed = trimEnd(this.inputReportData, 0);

        // If we are finished the last two bytes should be the CRC
        let lastTwo = trimmed.slice(trimmed.length - 2, trimmed.length);
        let crc = CrcCalculator.crc16(trimmed.slice(0, trimmed.length - 2));

        // The CRC returned from the device is in big endian, but the CRC calculates in little
        // This can be verified from the ViVopay documentation on page 11
        let temp = crc[0];
        crc[0] = crc[1];
        crc[1] = temp;

        if (arraysEqual(crc, lastTwo)) {
            if (this.readerCallback != null) {
                this.readerCallback(trimmed, DeviceState.DataReceived);
            } else {
                console.warn("No reader callback set");
            }

            this.inputReportData = new Uint8Array();
        }
    }


    /**
     * Gets the command from a response
     * 
     * @param {Uint8Array} data The data from the response
     */
    static getCommand = (data) => {
        return data[VIVOPAY_2_HEADER.length];
    }

    /**
     * Gets the response code from a response
     * 
     * @param {Uint8Array} data The data from the response
     */
    static getResponse = (data) => {
        return data[VIVOPAY_2_HEADER.length + 1];
    }
}