import React from 'react';
import Home from './components/Home.react';

function App() {
    return (
        <div className="App">
            {
                navigator.hid ?
                    <Home></Home>
                    :
                    <div>
                        <h3>The WebHID API is not available in your browser.</h3>
                        <h4>If you are using a Chromium based browser, make sure you are on the latest version and have <a href="chrome://flags/#enable-experimental-web-platform-features">Experimental features enabled</a></h4>
                    </div>
            }
        </div>
    );
}

export default App;
