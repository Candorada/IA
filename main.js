const express = require('express')
const app = express()
const fs = require('fs');
const os = require('os');
const port = 35231


function getLocalIp() {
    const interfaces = os.networkInterfaces();
    let localIP = '127.0.0.1'; // fallback
    for (const name in interfaces) {
    for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
        }
    }
    }
    return localIP;
}

app.get('/', async (req, res) => {
    fs.readFile("files/index.html", "utf8", function(err, html) {
        if (err) return res.status(404).send(err);
        res.send(html);
    })
    
})

app.listen(port, () => {
    const ip = getLocalIp()
    console.log(
` -- Starting Application -- 
    \x1b[1mLocal: \x1b[0m\x1b[1;34;34mhttp://localhost:${port}\x1b[0m
    \x1b[1mNetwork: \x1b[0m\x1b[1;34;34mhttp://${ip}:${port}\x1b[0m
 --                      -- `
    )
})