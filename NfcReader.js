class NfcReader {

    /**
     * Connects to the device and configures it
     * 
     * @param {HIDDevice} device 
     */
    constructor(device) {
        this.device = device;

        this.device.open().then(() => {
            console.log("Device opened");

            this.configure();
        });

        this.device.oninputreport = this.onInputReport;
    }

    setCallback(callback) {
        this.callback = callback;
    }

    configure() {
        // Set merchant ID

        // Set LTPK
    }

    ping() {

    }

    /**
     * 
     * @param {octet} command 
     * @param {octet} subCommand 
     * @param {Uint8Array} data The command data + CRC
     */
    sendCommand(command, subCommand, data) {
        if (!this.device.opened) {
            console.warn("Trying to use unopened device");

            return;
        }

        console.log("buildCommand output:");
        console.log(this.buildCommand(command, subCommand, data))

        data = this.buildCommand(command, subCommand, data);
        // Build the command with header, command, subcommand, length etc


        this.device.sendReport(0x01, data);

        if (this.callback != null) {
            this.callback(data, DeviceState.DataSent);
        } else {
            console.warn("No reader callback set");
        }
    }

    /**
     * Builds the command to send to the reader based on the parameters given
     * 
     * @param {octet} command The command to use
     * @param {octet} subCommand The subcommand to use
     * @param {Uint8Array} baseData The command data + CRC
     */
    buildCommand(command, subCommand, baseData) {
        const commandLength = 1;
        const subCommandLength = 1;
        const dataLengthLength = 2;
        const CRCLength = 2;

        // The CRC is present in the data here, but isn't counted in the payload length for the command
        // TODO Try to calculate the CRC manually
        let dataLength = baseData.length - CRCLength;
        let dataLengthAsByteArray = leftPad(intToByteArray(dataLength), 0, dataLengthLength);

        // Data is structured as:
        // HEADER - COMMAND (1 byte) - SUBCOMMAND (1 byte) - DATA LENGTH (2 bytes) - DATA - CRC (2 bytes)
        let data = new Uint8Array(VIVOPAY_2_HEADER.length + commandLength + subCommandLength + dataLengthLength + dataLength + CRCLength);

        // TOOD refactor this mess
        data.set(VIVOPAY_2_HEADER);

        data.set([command], VIVOPAY_2_HEADER.length);

        data.set([subCommand], VIVOPAY_2_HEADER.length + commandLength);

        data.set(dataLengthAsByteArray, VIVOPAY_2_HEADER.length + commandLength + subCommandLength);

        data.set(baseData, VIVOPAY_2_HEADER.length + commandLength + subCommandLength + dataLengthLength);

        return data;
    }

    onInputReport(e) {
        let data = e.data;

        console.log(e);
    }
}