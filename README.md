# Exploring the WebHID API

This project is a testing project for the [WebHID API](https://wicg.github.io/webhid/index.html).
The API gives access to HID devices in browsers, which previously was not possible. As of february 2020 the API is still in development, and still in an experimental state. It is currently only available in Chromium browsers.

WebHID is replacing the [chrome.hid](https://developer.chrome.com/apps/hid) API, which is an API for communicating with HID devices from Chrome apps. The chrome.hid API also did allow for communication with HID devices in Chromium browsers, but you needed to have the Chrome app installed and open, which is not really ideal. In addition to WebHID improving on this aspect, Chrome apps are getting killed soon and wouldn't work for long anyways.

The project uses the API to communicate with a VP3300 reader from Vivopay. The file [src/NfcReader.js](https://github.com/hakonschia/web-hid-api/blob/react/src/NfcReader.js) is a very lightweight JavaScript version of the [Universal SDK](https://idtechproducts.com/support/technical-blog/id/getting-started-with-id-techs-universal-sdk/) made by ID Tech (only support for VP3300, other devices using the ViVotech2 protocol might also work). Commands can be sent to the device using ```NfcReader.sendCommand(command, subCommand, data)```. There are also convenience methods for pinging the device and starting a transaction, which hides away the command and subcommand.

## Branches
### Master
The [master](https://github.com/hakonschia/web-hid-api/tree/master) branch is how the project looked before React was added. It is a pure HTML/JS application. I still needed to use an npm library, so I had to use [browserify](http://browserify.org/) to convert it to a file that allows npm libarires in pure HTML/JS applications. This is what the file [public/js/browserified/NdefParser.js](https://github.com/hakonschia/web-hid-api/blob/master/public/js/browserified/NdefParser.js) is, which is why it is so large.

### React
The [react](https://github.com/hakonschia/web-hid-api/tree/react) branch is the project converted to React. Since this is a React project now, npm libraries can be added without the use of browserify. It also has general improvements in some of the files that are also on the master branch
