let ui = {
    requestAccessBtn: null,
    outputText: null,
    testTransaction: null,
    pingDevice: null,

    commandInput: null,
    subCommandInput: null,
    commandDataInput: null,

    sendCommand: null
}

let nfcReader = null;

window.onload = () => {
    ui.requestAccessBtn = document.getElementById("requestAccess");
    ui.requestAccessBtn.onclick = requestAccessOnClick;

    ui.outputText = document.getElementById("outputText")

    ui.testTransaction = document.getElementById("testTransaction");
    ui.testTransaction.onclick = () => {
        //let hex = "5669564f746563683200024000169f0201009f030100ffee080adfef1a010adfed280103fd1a";
        let hex = "9f0201009f030100ffee080adfef1a010adfed280103fd1a";
        //let hex = "9f0201009f030100ffee080adfef1a010adfed280103";
        let bytes = hexToBytes(hex);

        nfcReader.sendCommand(0x02, 0x40, bytes);
    }

    ui.commandInput = document.getElementById("commandInput");
    ui.subCommandInput = document.getElementById("subCommandInput");
    ui.commandDataInput = document.getElementById("commandDataInput");

    ui.sendCommand = document.getElementById("sendCommand");
    ui.sendCommand.onclick = sendCommandOnClick;

    ui.pingDevice = document.getElementById("pingDevice");
    ui.pingDevice.onclick = () => {
        nfcReader.ping();
    }
}


/**
 * Click listener for the request access button
 * 
 * If access was given the nfcReader is initialized and connected
 */
let requestAccessOnClick = async () => {
    let device;

    try {
        device = await navigator.hid.requestDevice({
            filters: [{
                vendorId: VENDOR_ID,
                productId: PRODUCT_ID
            }]
        });
    } catch (err) {
        console.log(err);

        return;
    }

    console.log(device);

    if (device !== undefined) {
        nfcReader = new NfcReader(device);

        nfcReader.setCallback(readerCallback);
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
let sendCommandOnClick = () => {
    if (nfcReader != null) {
        let command = hexToBytes(ui.commandInput.value)[0];
        let subCommand = hexToBytes(ui.subCommandInput.value)[0];
        let data = hexToBytes(ui.commandDataInput.value);

        nfcReader.sendCommand(command, subCommand, data);
    } else {
        alert("No device connected");
    }
}


/**
 * Handles responses from the reader
 * 
 * @param {Uint8Array} data The data from the reader
 * @param {DeviceState} deviceState The state of the reader
 */
let readerCallback = (data, deviceState) => {
    let hex = bytesToHex(data);
    let command = NfcReader.getCommand(data);

    switch (deviceState) {
        case DeviceState.DataSent:
            ui.outputText.value += `Data sent: ${hex}\n`;
            break;

        case DeviceState.DataReceived:
            ui.outputText.value += `Data received: ${hex}\n`;

            // 0x02 = Activate transaction
            if (command == 0x02) {
                handleTransactionResponse(data);
            }

            break;

        default:
            break;
    }
}

let handleTransactionResponse = (data) => {
    let response = NfcReader.getResponse(data);

    // 0x57 = Loyalty response
    if (response == 0x57) {
        
    } else {
        console.warn("There was an error reading the pass")
    }
}