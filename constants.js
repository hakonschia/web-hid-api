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
const LTPK = "";

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
const MERCHANT_ID = "03D6019B";


/**
 * The header for the ViVoTech2 protocol. Always used at the
 * start of the data sent to the reader
 */
const VIVOPAY_2_HEADER = hexToBytes("5669564f746563683200");