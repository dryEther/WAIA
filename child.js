const { spawn } = require('child_process');

let webUIProcess = null;

// Enable/Disable WebUI
function toggleWebUI(enable) {
    if (enable && !webUIProcess) {
        console.log('Starting WebUI...');
        webUIProcess = spawn('node', ['webui.js'], {
            stdio: 'inherit'
        });

        // Optional: listen to webui process exit
        webUIProcess.on('exit', (code) => {
            console.log(`WebUI exited with code ${code}`);
            webUIProcess = null;
        });
    } else if (!enable && webUIProcess) {
        console.log('Stopping WebUI...');
        webUIProcess.kill();
        webUIProcess = null;
    }
}

// Handle exit: stop WebUI if running
process.on('exit', () => {
    if (webUIProcess) {
        webUIProcess.kill();
    }
});

// Also handle Ctrl+C and similar signals
['SIGINT', 'SIGTERM'].forEach(signal =>
    process.on(signal, () => {
        process.exit();
    })
);

// Example Usage
// setTimeout(() => toggleWebUI(true), 1000); // Start WebUI after 1s
// setTimeout(() => toggleWebUI(false), 10000); // Stop WebUI after 10s

module.exports = {
    toggleWebUI
};