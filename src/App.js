import React from 'react';

function App() {
    return (
        <div className="App">
            <button id="requestAccessBtn">Request access to reader</button>

            <br></br> <br></br>
            <button id="activateTransaction">Activate transaction</button>

            <button id="pingDevice">Ping device</button>

            <br></br> <br></br>
            <h2 id="smartTapRedemptionValue"></h2>

            <br></br> <br></br> <br></br>
            <label for="command">Command</label>
            <input type="number" name="command" id="commandInput"></input>


            <label for="subCommand">Sub command</label>
            <input type="number" name="subCommand" id="subCommandInput"></input>
            <br></br>

            <br></br>
            <label for="commandData">Command data</label>
            <br></br>
            <input type="text" name="commandData" id="commandDataInput"></input>

            <br></br>
            <br></br>
            <button id="sendCommand">Send command</button>

            <br></br>
            <textarea id="outputText" rows="40" cols="100" disabled></textarea>
        </div>
    );
}

export default App;
