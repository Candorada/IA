const express = require('express')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')
const app = express()
const fs = require('fs');
const os = require('os');
const port = 35231;
let db = open({
    filename: 'bistro.db',
    driver: sqlite3.Database
}); //must be awaited when used


function getLocalIp() {
    const interfaces = os.networkInterfaces();
    let localIP = '127.0.0.1'; // fallback
    let ips = [];
    for (const name in interfaces) {
    for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
            return iface.address;
        }
    }
    }
    return localIP;
}
const gridItemHTML = require("./files/gridItemHtml.js");
// function gridItemHTML(name, stock, expected, min, img){
//     return `
//     <div class = "item" style = "--img:url(${img?img:"./err.jpg"});">
//         <div class = "itemInner" id = "${name}">
//             ${name}
//             <div class = "buttonWrapper">
//                 <div class = "stock">
//                     <div class = "inner" style = "--inner:${Math.min(1,stock/expected)};"></div>
//                     <div class = "overlaytext">${stock}/${expected}</div>
//                     <div class = "minindicator" style = "--min:${min/expected};"></div>
//                 </div>
//                 <button class = "remove">MINUS</button>
//                 <button class = "add">PLUS</button>
//             </div>
//         </div>
//     </div> 
//     `;
// }
function getStorages(){
    return ["shiit","shiit2","shiit3"]
}
function getGridItems(storages){
    let data = {"shiit":[
        {name: "name of thing 1 from shiit1",stock: 20,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit1",stock: 20,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit1",stock: 20,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit1",stock: 20,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit1",stock: 20,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit1",stock: 20,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit1",stock: 20,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit1",stock: 20,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit1",stock: 20,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit1",stock: 20,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit1",stock: 20,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit1",stock: 20,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit1",stock: 20,expected: 100,min: 20,img: "err.jpg"},  
    ],
    "shiit2":[
        {name: "name of thing 1 from shiit2",stock: 50,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit2",stock: 50,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit2",stock: 50,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit2",stock: 50,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit2",stock: 50,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit2",stock: 50,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit2",stock: 50,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit2",stock: 50,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit2",stock: 50,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit2",stock: 50,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit2",stock: 50,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit2",stock: 50,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit2",stock: 50,expected: 100,min: 20,img: "err.jpg"},  
    ],
    "shiit3":[
        {name: "name of thing 1 from shiit3",stock: 10,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit3",stock: 10,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit3",stock: 10,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit3",stock: 10,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit3",stock: 10,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit3",stock: 10,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit3",stock: 10,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit3",stock: 10,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit3",stock: 10,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit3",stock: 10,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit3",stock: 10,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit3",stock: 10,expected: 100,min: 20,img: "err.jpg"},
        {name: "name of thing 1 from shiit3",stock: 10,expected: 100,min: 20,img: "err.jpg"},  
    ]}
    let out = [];
    for(storage of storages){
        if(data[storage]){
            out = [...out,...data[storage]]
        }
    }
    return out;
}
app.get('/', async (req, res) => {
    fs.readFile("files/index.html", "utf8", function(err, html) {
        if (err) return res.status(404).send(err);
        let storages = getStorages()
        let itemsHTML = getGridItems(storages).map(item=>gridItemHTML(item.name,item.stock,item.expected,item.min,item.img)).join("\n");
        html = html
        .replace("<!--[insert grid here]-->",itemsHTML)
        .replace("<!--[insert nodes here]-->",
            storages
            .map(storage=>`<button onclick="toggleSelect(this)" class="node selected">${storage}</button>`)
            .join("\n")
        );
        res.send(html);
    })
})

app.get(/files\/(.*)/, async (req, res) => {
    let txt = req.params[0]
    const options = {root: "./",dotfiles: 'deny',headers: {'x-timestamp': Date.now(),'x-sent': true}}
    res.sendFile(`files/${txt}`, options)
})
app.get("/settings",async (req,res)=>{
    fs.readFile("files/settings.html", "utf8", function(err, html) {
        if (err) return res.status(404).send(err);
        let storages = getStorages()
        let notification = "weakly"
        let email = "example@test.com"
        html = html
        .replace("<!--[lager goes here]-->",storages.map(storage=>`<div class = "lager" onclick="selectlager(this)">${storage}</div>`).join("\n"))
        .replace("<!-- email -->",email)
        .replace(`value="${notification}"`,`value = "${notification}" selected`)
        res.send(html);
    })
})
app.get("/storages",async (req,res)=>{
      res.json(getStorages());
})
app.get("/items",async (req,res)=>{
    let query = req.query;
    storages = getStorages().filter(storage=>query[storage] == "true" || query[storage] == undefined);
    console.log(storages);
    let json = getGridItems(storages);
    res.json(json);
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