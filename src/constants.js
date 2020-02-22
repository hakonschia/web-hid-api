/**
 * Vendor ID for ID Tech
 */
const VENDOR_ID = 0x0ACD;

/**
 * Product ID for VP3300
 */
const PRODUCT_ID = 0x3530;


/**
 * The LTPK data
 * Must be 32 bytes long
 */
const LTPK = "961949513dd3d1693ab64f13fb684ca242c0b1c4b5008ea02627f1304b900f7b";

/**
 * The LTPK version
 * Must be 4 bytes long
 * Must correspond to the public key version, see merchant center
 */
const LTPK_VERSION = "00000001";


/**
 * Our merchant ID, see merchant center
 * Must be 4 bytes long
 */
const MERCHANT_ID = "04bedbe7";

const MERCHANT_ID_DATA = "ffe4018edfee3b04" + MERCHANT_ID + "dfee3c00dfee3d00dfef2500dfed0100dfed02050000000001";


/**
 * The header for the ViVoTech2 protocol. Always used at the
 * start of the data sent to the reader
 */
const VIVOPAY_2_HEADER = hexToBytes("5669564f746563683200");