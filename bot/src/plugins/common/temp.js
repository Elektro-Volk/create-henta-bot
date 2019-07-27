/*
    let fileName = temp.getPath('jpg');
    ...
    temp.freePath(fileName);
*/
'use strict'
const path = require("path");
const fs = require("fs");

class TempPlugin {
    constructor(henta) {
        this.henta = henta;
        this.tempPaths = {};

        if (!fs.existsSync(`${henta.botdir}/temp/`)) fs.mkdirSync(`${henta.botdir}/temp/`);
        // Clear temp directory
        fs.readdir(`${henta.botdir}/temp/`, (err, paths) => paths.map(file => fs.unlinkSync(`${henta.botdir}/temp/${file}`)));
    }

    getPath(format) {
        for(let i = 0; true; i++) {
            let filePath = path.resolve(`${this.henta.botdir}/temp/${i}.${format}`);
            if(this.tempPaths[filePath]) continue;

            this.tempPaths[filePath] = true;
            return filePath;
        }
    }

    freePath(filePath) {
        delete this.tempPaths[filePath];
    }
}

module.exports = TempPlugin;
