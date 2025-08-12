const express = require('express')
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite')
const app = express()
app.use(express.json());
const fs = require('fs');
const os = require('os');
const port = 35231;
const db = new sqlite3.Database('bistro.db');
db.run(`
  CREATE TABLE IF NOT EXISTS Lager (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);
db.run(`
    CREATE TABLE IF NOT EXISTS Items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        img TEXT NOT NULL,
        email TEXT NOT NULL,
        stock INTEGER NOT NULL,
        min INTEGER NOT NULL,
        expected INTEGER NOT NULL,
        storage TEXT NOT NULL
    )
    `)
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
const lagerSettingsHTML = require("./files/lagerSettingsHTML.js");
async function getStorages(){
    let stuff = new Promise((r,j)=>{db.all("SELECT name FROM Lager",(err,rows)=>{
        if(err){
            j(err);
        }else{
            r(rows.map(row=>row.name));
        }
    });})
    return stuff;
}
async function getGridItems(storages){
    if(!storages) return [];
    return new Promise((r,j)=>{
        db.all("SELECT * FROM Items WHERE storage IN ("+storages.map(storage=>`'${storage}'`).join(",")+") ORDER BY name ASC",(err,rows)=>{
        if(err){
            console.log(err);
            r([]);
        }else{
            r(rows);
        }
    })
    })
    //return [{name: "name of thing 1 from shiit3",stock: 10,expected: 100,min: 20,img: "err.jpg"}];
}
app.get('/', async (req, res) => {
    fs.readFile("files/index.html", "utf8", async function(err, html) {
        if (err) return res.status(404).send(err);
        let storages = await getStorages()
        let itemsHTML = (await getGridItems(storages)).map(item=>gridItemHTML(item.name,item.stock,item.expected,item.min,item.img,false,item.storage)).join("\n");
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
app.post("/createLager",async (req,res)=>{
    let data = req.body;
    let name = data.name;
    db.run(`INSERT INTO Lager (name) VALUES ("${name}")`,()=>{
        res.status(200).send("ok");
    })
})
app.post("/deleteLager",async (req,res)=>{
    let data = req.body;
    let name = data.name;
    db.run(`DELETE FROM Lager WHERE name = "${name}"`,()=>{
        res.status(200).send("ok");
    })
})
app.post("/createItem",async (req,res)=>{
    let data = req.body;
    let name = data.name;
    let img = data.img;
    let email = data.email;
    let stock = data.stock;
    let min = data.min;
    let expected = data.expected;
    let storage = data.storage;
    db.run(`INSERT INTO Items (name,img,email,stock,min,expected,storage) VALUES ("${name}","${img}","${email}",${stock},${min},${expected},"${storage}")`,(err)=>{
        if(err){
            console.log(err);
            res.status(500).send("Fehler beim Erstellen des Items");
        }else{
            res.status(200).send("ok");
        }
    })
})
app.post("/deleteItem",async (req,res)=>{
    let data = req.body;
    let name = data.name;
    db.run(`DELETE FROM Items WHERE name = "${name}" AND storage = "${data.storage}"`,()=>{
        res.status(200).send("ok");
    })
})
app.post("/increaseStock",async (req,res)=>{
    let data = req.body;
    let name = data.name;
    let storage = data.storage;
    db.run(`UPDATE Items SET stock = stock + 1 WHERE name = "${name}" AND storage = "${storage}"`,()=>{
        res.status(200).send("ok");
    })
})
app.post("/decreaseStock",async (req,res)=>{
    let data = req.body;
    let name = data.name;
    let storage = data.storage;
    db.run(`UPDATE Items SET stock = stock - 1 WHERE name = "${name}" AND storage = "${storage}"`,()=>{
        res.status(200).send("ok");
    })
})
app.post("/setExpectedStock",async (req,res)=>{
    let data = req.body;
    let name = data.name;
    let storage = data.storage;
    let expected = data.expected;
    db.run(`UPDATE Items SET expected = ${expected} WHERE name = "${name}" AND storage = "${storage}"`,()=>{
        res.status(200).send("ok");
    })
})
app.post("/setStock",async (req,res)=>{
    let data = req.body;
    let name = data.name;
    let storage = data.storage;
    let stock = data.stock;
    db.run(`UPDATE Items SET stock = ${stock} WHERE name = "${name}" AND storage = "${storage}"`,()=>{
        res.status(200).send("ok");
    })
})
app.get("/settings",async (req,res)=>{
    fs.readFile("files/settings.html", "utf8", async function(err, html) {
        if (err) return res.status(404).send(err);
        let storages = await getStorages()
        let notification = "weakly"
        let email = "example@test.com"
        html = html
        .replace("<!--[lager goes here]-->",storages.map(storage=>lagerSettingsHTML(storage)).join("\n"))
        .replace("<!-- email -->",email)
        .replace(`value="${notification}"`,`value = "${notification}" selected`)
        res.send(html);
    })
})
app.get("/storages",async (req,res)=>{
      res.json(await getStorages());
})
app.get("/items",async (req,res)=>{
    let query = req.query;
    storages = (await getStorages()).filter(storage=>query[storage] == "true" || query[storage] == undefined);
    let json = await getGridItems(storages);
    res.status(200).json(json);
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