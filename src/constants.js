import { hexToBytes } from './util';

/**
 * Vendor ID for ID Tech
 */
export const VENDOR_ID = 0x0ACD;

/**
 * Product ID for VP3300
 */
export const PRODUCT_ID = 0x3530;


/**
 * The LTPK data (in hex)
 * Must be 32 bytes long
 */
export const LTPK = "961949513dd3d1693ab64f13fb684ca242c0b1c4b5008ea02627f1304b900f7b";

/**
 * The LTPK version (in hex)
 * Must be 4 bytes long
 * Must correspond to the public key version, see merchant center
 */
export const LTPK_VERSION = "00000001";


/**
 * Our merchant ID, see merchant center
 * Must be 4 bytes long
 */
const MERCHANT_ID = "04bedbe7";

/**
 * The data to set the merchant ID (in hex)
 */
export const MERCHANT_ID_DATA = "ffe4018edfee3b04" + MERCHANT_ID + "dfee3c00dfee3d00dfef2500dfed0100dfed02050000000001";



/**
 * The service type of the transaction. This specifies what types of Google Pay
 * card types to recognize, for example only loyalty passes
 * 
 * The different service types can be found in the ViVopay documentation
 */
export const SERVICE_TYPES = {
    all: "00",
    loyalty: "03"
}

/**
 * The service type to use
 */
export const SERVICE_TYPE = SERVICE_TYPES.loyalty;

/**
 * The data used for the activate transaction command
 * 
 * 9F02 and 9F03 are related to transactions, which is not used here so they are always 0
 * 
 * FFEE08 is a tag hodling smartTap information
 */
export const ACTIVATE_TRANSACTION_DATA = "9f0201009f030100ffee080adfef1a010adfed2801" + SERVICE_TYPE;

/**
 * The header for the ViVoTech2 protocol. Always used at the
 * start of the data sent to the reader
 */
export const VIVOPAY_2_HEADER = hexToBytes("5669564f746563683200");