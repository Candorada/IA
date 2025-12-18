function lagerSettingsHTML(storage){
    return `
            <div class = "lager">
                <div class = "lagerButton" onclick="selectlager(this.innerText)">${storage}</div>
                <div class = "lagerDelete" onclick = "deleteLager(this)"> - </div>
            </div>
            `;
}
if(typeof module !== "undefined"){
    module.exports = lagerSettingsHTML;
}