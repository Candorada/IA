const express = require('express')
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const app = express()
app.use(express.json());
const fs = require('fs');
const os = require('os');
const port = 35231;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('bistro.db');
function createTables(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS Lager (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        )
      `, (err) => { if (err) reject(err); });

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
      `, (err) => { if (err) reject(err); });

      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `, (err) => { if (err) reject(err); });

      // All runs are queued; to resolve after all, use 'db.exec' or track completions
      // Since db.run callbacks may be called asynchronously, let's track completion count:

      let completed = 0;
      const total = 3;

      function checkDone(err) {
        if (err) reject(err);
        completed++;
        if (completed === total) resolve();
      }

      // Re-run with the checkDone callback

      db.run(`
        CREATE TABLE IF NOT EXISTS Lager (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        )
      `, checkDone);

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
      `, checkDone);

      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `, checkDone);

    });
  });
}
const settings = {

};
const defualtSettings = {
    "email":"example@test.com",
    "password":"",
    "notification":"immer",
}
async function getEmailText(){
    let items =  await new Promise((r,j)=>db.all("SELECT * FROM Items WHERE stock < min",(err,rows)=>{
        if(err){
            j(err);
        }else{
            r(rows);
        }
    }))
    if(items.length == 0) return "";
    let str = `Diese Producte Mussen noch gekauft werden
${items.map(item=>`- ${item.name} in ${item.storage} nur noch ${item.stock}/${item.expected}`).join("\n")}
    `;
    console.log(str);
    return str;
}
const schedules = {
    "immer":{cron:"* * * * *",subject:()=>"Direkte Lager Meldung",text:getEmailText,html:()=>{}},
    "täglich":{cron:"0 19 * * *",subject:()=>"Tägliche Lager Meldung",text:getEmailText,html:()=>{}},
    "wöchendlich":{cron:"0 0 * * 7 *",subject:()=>"Wöchentlich Lager Meldung Sontag",text:getEmailText,html:()=>{}},
    "monatlich":{cron:"59 23 24-31 * 0",subject:()=>"Ende des Monats Lager Meldung Sontag",text:getEmailText,html:()=>{}},
}

let transporter;
let scheduledEvent;
function updateTransporter(){
    transporter = new Promise(async (r,j)=>{
    try{
        let n = nodemailer.createTransport({
        service: (await getSetting("email")).split("@")[1]?.split(".")[0], // or SMTP server
        secure:false,
        auth: {
            user: await getSetting("email"),
            pass: await getSetting("password"),
        },
        });
        n.on('error', (err) => {
        if (err.code === 'EAUTH') {
            console.error('Auth error event from transporter:', err);
            mailerIsValid = false; // your flag to disable future sends
        } else {
            console.error('Other transporter error:', err);
        }
        });
        r(n)
    }catch( err){
        r("Error creating transporter"+err);
    }
});
}
function getNewCron(not){
    return new Promise(async (r,j)=>{
        let notification = not?not:await getSetting("notification");
        r(cron.schedule(schedules[notification].cron, async () => {
        console.log("Running email job...");
        sendEmail(await schedules[notification].subject(),await schedules[notification].text(),await schedules[notification].html());
        }));
    })
}
const settingCallBacks = {
    "email":(newValue)=>{
        updateTransporter();
    },
    "password":(newValue)=>{
        updateTransporter();
    },
    "notification":async (newValue)=>{
        (await scheduledEvent).destroy();
        scheduledEvent = getNewCron(newValue);
    },
};

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
async function getSetting(setting){
    if(settings[setting]) return settings[setting];
    return new Promise((r,j)=>{
        db.get(`SELECT value FROM settings WHERE key = "${setting}"`,(err,row)=>{
            if(err){
                if(setting in defualtSettings){
                    settings[setting] = defualtSettings[setting];
                    r(defualtSettings[setting]);
                }else{
                    j(err);
                }
            }else{
                let retVal = row?row.value:undefined;
                if(!retVal) retVal = defualtSettings[setting];
                settings[setting] = retVal;
                r(retVal);

            }
        })
    })
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
app.post("/setSetting",async (req,res)=>{
    let data = req.body;
    let setting = data.setting;
    let value = data.value;
    db.run(`INSERT OR REPLACE INTO settings (key,value) VALUES ("${setting}","${value}")`,()=>{
        res.status(200).send("ok");
        console.log(setting,value);
        settings[setting] = value;
        settingCallBacks[setting]?settingCallBacks[setting](value):"";
        sendEmail("Setting Wurde geändert",`Der Wert für ${setting} wurde geändert zu ${value}`);
    })
})
app.get("getSetting",async (req,res)=>{
    let setting = req.query.setting;
    getSetting(setting).then((value)=>{
        res.status(200).send(value);
    }).catch(err=>{
        res.status(500).send(err);
    })
})
app.get("/settings",async (req,res)=>{
    fs.readFile("files/settings.html", "utf8", async function(err, html) {
        if (err) return res.status(404).send(err);
        let storages = await getStorages()
        let notification = await getSetting("notification").catch(()=>"weakly")
        let email = await getSetting("email").catch(()=>"example@test.com")
        let password = await getSetting("password").catch(()=>"")
        html = html
        .replace("<!--[lager goes here]-->",storages.map(storage=>lagerSettingsHTML(storage)).join("\n"))
        .replace("<!-- email -->",email)
        .replace(`<!--[notifications go here]-->`,Object.keys(schedules).map(key=>`<option value="${key}" ${key == notification?"selected":""}>${schedules[key].subject()}</option>`).join("\n"))
        .replace(`<!-- password -->`,password)
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
app.get("/db",async (req,res)=>{
    res.sendFile("bistro.db");
})
createTables(db).then(()=>{
    scheduledEvent = getNewCron();
    updateTransporter();
    app.listen(port, () => {
        const ip = getLocalIp()
    let text = ` -- Application Started -- 
        \x1b[1mLocal: \x1b[0m\x1b[1;34;34mhttp://localhost:${port}\x1b[0m
        \x1b[1mNetwork: \x1b[0m\x1b[1;34;34mhttp://${ip}:${port}\x1b[0m
    --                      -- `
    sendEmail("Lager app online","Die Lager app ist online\n"+`
        http://localhost:${port}
        http://${ip}:${port}`);
    console.log(text);
    })
})


async function sendEmail(s,t,h) {
    if(t == "") return;
    let email = await getSetting("email");
  try {
    await (await transporter).sendMail({
      from: `Lager App <${email}>`,
      to: email,
      subject: s,
      text: t,
      html:h,
    });
    console.log("Email sent!");
  } catch (err) {
    console.error("Error sending email:", err);
    return;
  }
}