function gridItemHTML(name, stock, expected, min, img, isSetting = false,storage){
        return `
        <div class = "item" style = "--img:url(${img?img:"./err.jpg"});" storage = "${storage}" name = "${name}">
            <div class = "itemInner" id = "${name}">
                ${name}
                <div class = "buttonWrapper">
                    <div class = "stock">
                        <div class = "inner" style = "--inner:${Math.min(1,stock/expected)};"></div>
                        <div class = "overlaytext">${isSetting?`<input type = "text" value = "${stock}" class = "settingModify" onchange = "setStock(this)">`:stock}/${isSetting?`<input type = "text" value = "${expected}" class = "settingModify" onchange="setExpectedStock(this)">`:expected}</div>
                        <div class = "minindicator" style = "--min:${min/expected};"></div>
                    </div>
                    ${isSetting?`
                        <button class = "delete" onclick = "deleteItem(this)">Löschen</button>
                    `:`
                        <button class = "remove" onclick = "minus(this)">MINUS</button>
                        <button class = "add" onclick = "plus(this)">PLUS</button>`
                    }
                </div>
            </div>
        </div> 
        `;
    }
if(typeof module !== "undefined"){
    module.exports = gridItemHTML;
}