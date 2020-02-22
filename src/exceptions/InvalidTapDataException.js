export default class InvalidTapDataException {
    constructor(msg) {
        this.msg = msg;
    }

    getMessage() {
        return this.msg;
    }
}