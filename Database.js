const request = require('request-promise-native');
const fs = require('fs');
const { Client } = require('pg');
const yauzl = require("yauzl");

module.exports = class Database {

    constructor() {
        let dlSuccess = true

        const popOptions = {
            url: 'http://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=csv',
            encoding: null
          };

        // Download population zip data from world bank API
        const poprequest = request(popOptions)
        .catch(function(err) {
            console.log("worldbank api call for pop failed")
            dlSuccess = false;
            zipOut('pop_backup.zip', 'pop.csv')
          })
        .then(function (res) {
            fs.writeFileSync('pop.zip', res);
          });

        // Download co2 zip data from world bank API
        //request('http://api.worldbank.org/v2/en/indicator/EN.ATM.CO2E.KT?downloadformat=csv')

        const co2Options = {
            url: 'http://api.worldbank.org/v2/en/indicator/EN.ATM.CO2E.KT?downloadformat=csv',
            encoding: null
          };

        const co2request = request(co2Options)
        .catch( function(err) {
            console.log("worldbank api call for co2 failed")
            dlSuccess = false;
            zipOut('co2_backup.zip', 'co2.csv')
          })
        .then(function (res) {
            fs.writeFileSync('pop.zip', res);
          });

        
        // Create db connection
        this.client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
        });

        // Detect local database environment, disable SSL
        // Expecting local database at postgresql:///<username> with no SSL/authentication
        if(process.env.DATABASE_URL == ("postgresql:///" + process.env.USER) ) {
        this.client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: false,
        });
        }

        this.attemptInit()
    }

    attemptInit() {
        this.client.connect();

        this.client.query('CREATE TABLE IF NOT EXISTS countries ()', (err, res) => {
            if (err) {
                console.log("There was an error in creating the initial table. Note that if this fails, you're not connecting to the database correctly")
                console.log(err)
                throw err;
            }

            console.log(res)
            this.client.end();
        });
    }
}

function zipOut(inputname,outputname) {
    // Boilerplate stuff copied
    yauzl.open(inputname, {lazyEntries: true}, function(err, zipfile) {
        if (err) throw err;
        zipfile.readEntry();
        zipfile.on("entry", function(entry) {
            console.log(entry.fileName)

            if (/\/$/.test(entry.fileName)) {
            // Directory file names end with '/'.
            // Note that entires for directories themselves are optional.
            // An entry's fileName implicitly requires its parent directories to exist.
            } else {
                // file entry
                zipfile.openReadStream(entry, function(err, readStream) {
                    if (err) throw err;
                    readStream.on("end", function() {
                        //Continue overwriting on metadata entries
                        if (entry.fileName.includes("Metadata")) {
                            zipfile.readEntry();
                        }
                    });
                    readStream.pipe(fs.createWriteStream(outputname));
                });
            }
        });
    });

}



