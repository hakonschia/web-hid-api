import { VIVOPAY_2_HEADER } from './constants';
import { bytesToHex, hexToBytes, leftPad, intToByteArray, lastBlank, trimEnd } from './util';
import CrcCalculator from './CrcCalculator';
import ReaderNotConnected from './exceptions/ReaderNotConnected';
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

            throw new ReaderNotConnected("Reader is not connected or has not yet been opened");
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

        // The CRC is present in the data here, but isn't counted in the payload length for the command
        // TODO Try to calculate the CRC manually
        let dataLength = baseData.length;
        let dataLengthAsByteArray = leftPad(intToByteArray(dataLength), 0, dataLengthLength);

        // Data is structured as:
        // HEADER - COMMAND (1 byte) - SUBCOMMAND (1 byte) - DATA LENGTH (2 bytes) - DATA - CRC (2 bytes)
        let length = headerLength + commandLength + subCommandLength + dataLengthLength + dataLength + CRCLength;
        let data = new Uint8Array(length);

        // TOOD refactor this mess
        data.set(VIVOPAY_2_HEADER);

        data.set([command], headerLength);

        data.set([subCommand], headerLength + commandLength);

        data.set(dataLengthAsByteArray, headerLength + commandLength + subCommandLength);

        data.set(baseData, headerLength + commandLength + subCommandLength + dataLengthLength);

        // Calculate the CRC from the entire command so far
        let crc = CrcCalculator.crc16(data.slice(0, data.length - CRCLength));

        data.set(crc, headerLength + commandLength + subCommandLength + dataLengthLength + dataLength);

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
        console.log(e);
        let data = new Uint8Array(e.data.buffer);

        // The data returned is always 63 bytes long, if the end of the array isn't a 0
        // more data is coming later, so do not call the callback yet, but append the data together first

        let newData = new Uint8Array(this.inputReportData.length + data.length);
        newData.set(this.inputReportData);
        newData.set(data, this.inputReportData.length);

        this.inputReportData = newData;

        // Can maybe check something with the start being the header?
        // Maybe something with the CRC can be done
        // TODO this doesn't really work because it can end on 0 without being finished
        if (lastBlank(data)) {
            if (this.readerCallback != null) {
                let trimmed = trimEnd(this.inputReportData, 0);

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