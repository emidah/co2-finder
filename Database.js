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

        try {
            fs.mkdirSync('data')
        } catch (err) {
        }
    

        try {
            fs.mkdirSync('downloads')
        } catch (err) {
        }
    
        // Paths for downloaded zip files
        const popZipPath = "./downloads/pop.zip"
        const co2ZipPath = "./downloads/co2.zip"

        // Paths for backup zip files in case the api was down
        const popBackupPath = "./backups/pop_backup.csv"
        const co2BackupPath = "./backups/co2_backup.csv"

        // The actual paths the data is pulled from
        let popPath = "./data/pop.csv"
        let co2Path = "./data/co2.csv"


        let popUrl = "http://localhost"
        let co2Url = "http://localhost"
        if (process.env.NODE_ENV === 'production') {
            console.log("production mode, api calls enabled")
            popUrl = 'http://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=csv'
            co2Url = 'http://api.worldbank.org/v2/en/indicator/EN.ATM.CO2E.KT?downloadformat=csv'
        }

        // Set up downloads
        const popOptions = {
            url: popUrl,
            encoding: null
          };

        const co2Options = {
            url: co2Url,
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
            if(process.env.NODE_ENV === 'production' || err.error.errno !== 'ECONNREFUSED'){
                console.log(err)
            }
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
            if(process.env.NODE_ENV === 'production' || err.error.errno !== 'ECONNREFUSED'){
                console.log(err)
            }
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
        let firstYear1 = 2000;
        this.pop_data = new Map(pop_data.map(i => 
            {   
                while(i[firstYear1+""] !== '' && i[firstYear1+""] != null){
                    firstYear1--;
                }
                return [i['Country Code'], i]
            }
            ));

        let firstYear2 = 2000;
        this.co2_data = new Map(co2_data.map(i =>  {   
            while(i[firstYear2+""] !== '' && i[firstYear2+""] != null){
                firstYear2--;
            }
            return [i['Country Code'], i]
        })); 

        let firstYear = Math.max(firstYear1, firstYear2);
        

        Array.from(this.pop_data.values()).forEach(v => {
            for(let i = 1960; i <= firstYear; i++){
                delete v[i+""];
            }
        })

        Array.from(this.co2_data.values()).forEach(v => {
            for(let i = 1960; i <= firstYear; i++){
                delete v[i+""];
            }
        })
        
        let max = 2010;
        for(let i = 2010; i<3000; i++){
            if(!(i in this.co2_data.get("USA")) || this.co2_data.get("USA")[i] === ''){
                max = i - 1;
                break;
            }
        }

        this.topCo2PerCapita = this.getTop(null, co2_data.map(x => {
            const obj = {
                "Country Name": x["Country Name"],
                "Country Code": x["Country Code"],
            }
            const co2 = parseFloat(x[max]);
            const pop = parseFloat(this.pop_data.get(x["Country Code"])[max]);
            if(co2 === 0 || isNaN(co2) || pop === 0 || isNaN(pop)){
                obj[max] = 0;
            } else {
                obj[max] = co2/pop;
            }
            obj["data"] = obj[max]
            obj["year"] = max
            //console.log(obj)
            return obj;
        }));
    }

    getTop(count, data){
        let max = 2000;
        for(let i = 2100; i>1960; i--){
            if(((i in data[0]) && data[0][i] !== '') 
            || ((i in data[1]) && data[1][i] !== '') 
            || ((i in data[2]) && data[2][i] !== '' || (i in data[2]) && data[2][i] !== '')
            ){
                max = i;
                break;
            }
        }

        //filter out all the non-country data
        data = data.map(x => {
            if(! (x["Country Name"].includes('total') 
            || x["Country Name"].includes('World')
            || x["Country Name"].includes('income')
            || x["Country Name"].includes('IBRD')
            || x["Country Name"].includes('demographic')
            || x["Country Name"].includes('Asia')
            || x["Country Name"].includes('Euro')
            || x["Country Name"].includes('America')
            || x["Country Name"].includes('OECD')
            || x["Country Name"].includes('Africa')
            )) return x
        })
        data.sort( (a,b) => {
            if ((a[max] === "" && b[max] !== "" ) || parseFloat(a[max]) < parseFloat(b[max])){
                return 1
            }
            if ((a[max] !== "" && b[max] === "" ) || parseFloat(a[max]) > parseFloat(b[max])) {
                return -1
            }
            return 0
        })
        return data.slice(0, count || data.length)
    }
}

/**
 * Unzips the file without "metadata" in the title, takes input and output paths
 * @param {string} inputname 
 * @param {string} outputname 
 */
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
    
    fs.renameSync(filename, outputname);

}

/**
 * Removes the first few lines of useless CSV data. Checks for the word "Country", 
 * as that should always be in the header row of our dataset.
 * @param {*} filename 
 */
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


