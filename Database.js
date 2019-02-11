const request = require('request-promise-native');
const fs = require('fs');
const AdmZip = require("adm-zip");
const csv = require('csvtojson')
 
module.exports = class Database {
    constructor () {

    }

    async initialize() {

        const popZipPath = "pop.zip"
        const co2ZipPath = "co2.zip"
        const popBackupPath = "pop_backup.csv"
        const co2BackupPath = "co2_backup.csv"
        const tempPopPath = "pop.zip"
        const tempCo2Path = "co2.zip"
        let popPath = "pop.zip"
        let co2Path = "co2.zip"

        const popOptions = {
            url: 'localhost',//''http://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=csv',
            encoding: null
          };

        const co2Options = {
            url: 'localhost',//'http://api.worldbank.org/v2/en/indicator/EN.ATM.CO2E.KT?downloadformat=csv',
            encoding: null
          };

        // Download co2 zip data from world bank API
        const co2request = request(co2Options)
        .then(function (res) {
            fs.writeFileSync(co2ZipPath, res);
            unZip(co2ZipPath,tempCo2Path)
            trimLines(co2Path);
        })
        .catch(function (err){
            co2Path = co2BackupPath
            console.log("fetching co2 data failed, using backup")
        });   

        // Download population zip data from world bank API
        const poprequest = request(popOptions)
        .then(function (res) {
            fs.writeFileSync(popZipPath, res);
            unZip(popZipPath,tempPopPath);
            trimLines(popPath);
        })
        .catch(function (err){
            popPath = popBackupPath
            console.log("fetching pop data failed, using backup")
        });
        
        await poprequest
        await co2request

        //Convert csvs to json objects

        let pop_data = new Object()
        const popObj = csv()
        .fromFile(popPath)
        .then((jsonObj)=>{
            pop_data = jsonObj
        })
        
        let co2_data = new Object()
        const co2Obj = csv()
        .fromFile(co2Path)
        .then((jsonObj)=>{
            co2_data = jsonObj
        })

        await co2Obj
        await popObj

        //Json objecs are Arrays, we want hashmaps.
        this.pop_data = new Map(pop_data.map(i => [i['Country Code'], i]));
        this.co2_data = new Map(co2_data.map(i => [i['Country Code'], i]));
        

        //console.log(this.co2_data)
        
    }

    async setUp() {
        await this.initialize().catch(function (err) {
            throw err;
        });

        //console.log("yes")

    }

}

function unZip(inputname,outputname) {
    // Boilerplate stuff copied
    var zip = new AdmZip(inputname);
    var zipEntries = zip.getEntries(); // an array of ZipEntry records
 
    zipEntries.forEach(function(zipEntry) {
        if (!zipEntry.entryName.includes("Metadata")) {
            zip.extractEntryTo(zipEntry, outputname);
        }
    });

}

function trimLines(filename){
    console.log("test")
    const file = fs.readFileSync(filename, 'utf8');
    console.log("test")
    
    let lines = file.split("\n")
    let splitAt = 0
    for (let i = 0; i < lines.length; i++){
        if(lines[i].includes("Country")){
            splitAt = i
            break;
        }
    }
    let out = lines.slice(splitAt).join('\n');
    fs.writeFileSync(filename, out);

}


