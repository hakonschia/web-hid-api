import React from 'react';
import NdefParser from '../NdefParser';
import NfcReader from '../NfcReader';
import { VENDOR_ID, PRODUCT_ID, MERCHANT_ID_DATA, LTPK, LTPK_VERSION } from '../constants';
import { hexToBytes, bytesToHex } from '../util';
import DeviceState from '../DeviceState';

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        this.nfcReader = new NfcReader();

        this.state = {
            outputText: "",
            smartTapRedemptionValue: "",

            commandInput: null,
            subCommandInput: null,
            commandDataInput: null
        };
    }


    /**
     * Finds the device if it is already paired
     * 
     * @returns A promise either containing the HIDDevice if it was found, otherwise it contains null
     */
    getDevice = async () => {
        let device = await navigator.hid.getDevices({
            filters: [{
                vendorId: VENDOR_ID,
                productId: PRODUCT_ID
            }]
        });

        return device.length == 0 ? null : device[0];
    }

    /**
     * Prompts the user for access to the reader
     * If access was given the nfcReader is initialized and connected
     */
    requestAccess = async () => {
        try {
            let device = await navigator.hid.requestDevice({
                filters: [{
                    vendorId: VENDOR_ID,
                    productId: PRODUCT_ID
                }]
            });

            this.initializeReader(device);
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Initializes the NFC reader
     * 
     * @param {HIDDevice} device The HIDDevice returned from getDevices() or requestDevices()
     */
    initializeReader = (device) => {
        this.nfcReader = new NfcReader(device);

        this.nfcReader.connect(connected => {
            if (connected) {
                this.nfcReader.setCallback(this.readerCallback);

                this.configureReader();
            }
        });
    }

    /**
     * Configures the reader
     * 
     * Sets the merchant ID and LTPK
     */
    configureReader = () => {
        let crc = "541d";
        // Set merchant ID
        this.nfcReader.sendCommand(0x04, 0x03, hexToBytes(MERCHANT_ID_DATA + crc));

        crc = "5790";
        // Set LTPK
        this.nfcReader.sendCommand(0xC7, 0x65, hexToBytes(LTPK_VERSION + LTPK + crc));
    }

    pingDevice = () => {
        this.nfcReader.ping();
    }

    activateTransaction = () => {
        console.log("Activate")
        //let hex = "5669564f746563683200024000169f0201009f030100ffee080adfef1a010adfed280103fd1a";
        let hex = "9f0201009f030100ffee080adfef1a010adfed280103fd1a";
        //let hex = "9f0201009f030100ffee080adfef1a010adfed280103";
        let bytes = hexToBytes(hex);

        try {
            this.nfcReader.activateTransaction(bytes);
        } catch {
            alert("No reader connected");
        }
    }


    /**
     * Click listener for the "Send command" button
     * 
     * Sends a command to the reader based on the values in commandInput, subCommandInput
     * and commandDataInput
     * 
     * If the reader isn't connected an alert is shown
     */
    sendCommandOnClick = () => {
        try {
            let command = hexToBytes(this.state.commandInput.toString())[0];
            let subCommand = hexToBytes(this.state.subCommandInput.toString())[0];
    
            let data = this.state.commandDataInput;
            if (data != null) {
                data = hexToBytes(data);
            } else {
                data = new Uint8Array();
            }
    
            console.log(data);
    
            this.nfcReader.sendCommand(command, subCommand, data);
        } catch(error) {
            alert("No reader connected")
        }
    }

    /**
     * Handles responses from the reader
     * 
     * @param {Uint8Array} data The data from the reader
     * @param {DeviceState} deviceState The state of the reader
    */
    readerCallback = (data, deviceState) => {
        let hex = bytesToHex(data);
        let command = NfcReader.getCommand(data);

        switch (deviceState) {
            case DeviceState.DataSent:
                this.setState({
                    outputText: this.state.outputText += `Data sent: ${hex}\n`
                });
                break;

            case DeviceState.DataReceived:
                this.setState({
                    outputText: this.state.outputText += `Data received: ${hex}\n`
                });

                // 0x02 = Activate transaction
                if (command == 0x02) {
                    this.handleTransactionResponse(data);
                }

                break;

            default:
                break;
        }
    }

    /**
     * Handles the responses from transaction commands
     * 
     * Tries to find the smartTapRedemptionValue
     * 
     * @param {Uint8Array} data The data from a SmartTap 
     */
    handleTransactionResponse = (data) => {
        let response = NfcReader.getResponse(data);

        // 0x57 = Loyalty response
        if (response == 0x57) {
            let redemptionValue = NdefParser.getSmartTapRedemptionValue(data);

            console.log("smartTapRedemptionValue:", redemptionValue);
            this.setState({
                smartTapRedemptionValue: redemptionValue
            })
            // ui.smartTapRedemptionValue.innerHTML = "Data read from phone: " + smartTapRedemptionValue;
        } else {
            console.warn("There was an error reading the pass")
        }
    }

    /**
     * Checks if the device is already paired on startup
     */
    componentWillMount() {
        this.getDevice().then(device => {
            if (device != null) {
                this.initializeReader(device);
            }
        });
    }


    render() {
        return (
            <div>
                <button id="requestAccessBtn" onClick={this.requestAccess}>Request access to reader</button>

                <br></br> <br></br>
                <button id="activateTransaction" onClick={this.activateTransaction}>Activate transaction</button>

                <button id="pingDevice" onClick={this.pingDevice}>Ping device</button>

                <br></br> <br></br>
                <h2>{this.state.smartTapRedemptionValue}</h2>

                <br></br> <br></br> <br></br>
                <label htmlFor="command">Command</label>
                <input type="number" name="command" onChange={e => this.setState({commandInput: e.target.value})}></input>

                <label htmlFor="subCommand">Sub command</label>
                <input type="number" name="subCommand" onChange={e => this.setState({subCommandInput: e.target.value})}></input>
                <br></br>

                <br></br>
                <label htmlFor="commandData">Command data + CRC</label>
                <br></br>
                <input type="text" name="commandData" onChange={e => this.setState({commandDataInput: e.target.value})}></input>

                <br></br>
                <br></br>
                <button id="sendCommand" onClick={this.sendCommandOnClick}>Send command</button>

                <br></br>
                <textarea rows="40" cols="100" type="text" value={this.state.outputText} disabled></textarea>
            </div>
        )
    }
}