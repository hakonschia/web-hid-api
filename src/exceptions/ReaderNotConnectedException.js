export default class ReaderNotConnectedException {
    constructor(msg) {
        this.msg = msg;
    }

    getMessage() {
        return this.msg;
    }
}