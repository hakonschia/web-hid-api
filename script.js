let ui = {
    requestAccessBtn: null,
    outputText: null,
    testTransaction: null
}

let nfcReader = null;

window.onload = () => {
    let arr = [0x23];

    console.log(leftPad(arr, 0, 2));

    console.log(intToByteArray(273))



    ui.requestAccessBtn = document.getElementById("requestAccess");
    ui.requestAccessBtn.onclick = requestAccessOnClick;

    ui.outputText = document.getElementById("outputText")
    ui.testTransaction = document.getElementById("testTransaction");

    ui.testTransaction.onclick = () => {
        //let hex = "5669564f746563683200024000169f0201009f030100ffee080adfef1a010adfed280103fd1a";
        let hex = "9f0201009f030100ffee080adfef1a010adfed280103fd1a";
        let bytes = hexToBytes(hex);

        nfcReader.sendCommand(0x02, 0x40, bytes);
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
 * Handles responses from the reader
 * 
 * @param {Uint8Array} data 
 * @param {DeviceState} deviceState 
 */
let readerCallback = (data, deviceState) => {
    console.log("Data:");
    console.log(data);

    let hex = bytesToHex(data);

    console.log("State:", deviceState);

    switch (deviceState) {
        case DeviceState.DataSent:
            ui.outputText.value += "Data sent: " + data + "\n";
            ui.outputText.value += "Data sent: " + hex + "\n";
            break;

        case DeviceState.DataReceived:
            ui.outputText.value += "Data received: " + hex + "\n";
            break;

        default:
            break;
    }
}