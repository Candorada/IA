function gridItemHTML(name, stock, expected, min, img, isSetting = false){
        return `
        <div class = "item" style = "--img:url(${img?img:"./err.jpg"});">
            <div class = "itemInner" id = "${name}">
                ${name}
                <div class = "buttonWrapper">
                    <div class = "stock">
                        <div class = "inner" style = "--inner:${Math.min(1,stock/expected)};"></div>
                        <div class = "overlaytext">${stock}/${expected}</div>
                        <div class = "minindicator" style = "--min:${min/expected};"></div>
                    </div>
                    ${isSetting?`
                        <button class = "delete">Löschen</button>
                    `:`
                        <button class = "remove">MINUS</button>
                        <button class = "add">PLUS</button>`
                    }
                </div>
            </div>
        </div> 
        `;
    }
if(typeof module !== "undefined"){
    module.exports = gridItemHTML;
}