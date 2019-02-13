const request = require('request-promise-native');
const fs = require('fs');
const AdmZip = require("adm-zip");
const csv = require('csvtojson')
 
module.exports = class Database {
    constructor () {
    }

    // Initialize a "database" in memory by pulling zips from the world bank api.
    // A relational database (such as Heroku's integrated Postgres) would make more sense, 
    // but it's also more complicated...

    async initialize() {

        // Paths for downloaded zip files
        const popZipPath = "./downloads/pop.zip"
        const co2ZipPath = "./downloads/co2.zip"

        // Paths for backup zip files in case the api was down
        const popBackupPath = "./backups/pop_backup.csv"
        const co2BackupPath = "./backups/co2_backup.csv"

        // The actual paths the data is pulled from
        let popPath = "./data/pop.csv"
        let co2Path = "./data/co2.csv"


        // Set up downloads
        const popOptions = {
            url: 'localhost',//'http://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=csv',
            encoding: null
          };

        const co2Options = {
            url: 'localhost', //http://api.worldbank.org/v2/en/indicator/EN.ATM.CO2E.KT?downloadformat=csv',
            encoding: null
          };

        // Download co2 zip data from world bank API, write it to a file, unzip it and remove the csv metadata lines
        const co2request = request(co2Options)
        .then(function (res) {
            fs.writeFileSync(co2ZipPath, res);
            unZip(co2ZipPath,co2Path)
            trimLines(co2Path);
        })
        .catch(function (err){
            co2Path = co2BackupPath
            trimLines(co2Path);
            console.log(err)
        });   

        // Download population zip data from world bank API, write it to a file, unzip it and remove the csv metadata lines
        const poprequest = request(popOptions)
        .then(function (res) {
            fs.writeFileSync(popZipPath, res);
            unZip(popZipPath,popPath);
            trimLines(popPath);
        })
        .catch(function (err){
            popPath = popBackupPath
            trimLines(popPath);
            console.log(err)
        });
        
        await poprequest
        await co2request
        
        // Convert our new csvs to json objects

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
        
    }

}

// Unzips files with input and output paths...
function unZip(inputname,outputname) {

    // Boilerplate stuff copied

    let filename = "";
    var zip = new AdmZip(inputname);
    var zipEntries = zip.getEntries(); // an array of ZipEntry records
 
    zipEntries.forEach(function(zipEntry) {
        if (!zipEntry.entryName.includes("Metadata")) {
            zip.extractEntryTo(zipEntry, '.',false, true);
            filename = zipEntry.name;
        }
    });
    
    try {
        fs.mkdirSync('data')
    } catch (err) {

    }

    fs.renameSync(filename, outputname);

}

// Removes the first few lines of useless CSV data
function trimLines(filename){
    const file = fs.readFileSync(filename, 'utf8');
    
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


