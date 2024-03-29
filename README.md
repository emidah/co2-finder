# Co2-finder: CO2 by country / region / demographic

## Live at http://co2.em1l.com

A project developed based on the Reaktor 2019 summer job assignment requirements, built using nodejs + react. The server can be found at this root directory, and the client lives at [/client](/client/).

The site supports both mobile and desktop devices with different layouts.

Population and emissions data courtesy of the World Bank, used under the CC4.0 license.

## How to run it

```
cd client/
npm install
npm run build
cd ..
npm install
npm start
```

The application will be live at http://localhost:5000

Note that the application will not make real api calls in non-production environments.

## How does it work

The server is based on nodejs+express. It first downloads the data .csvs, loads them into memory and then serves them each line at

```
/api/co2/countries/[COUNTRY CODE]
/api/pop/countries/[COUNTRY CODE]
```
in json format. Top polluters are at
```
/api/co2/top/[COUNT]
/api/co2/toppercapita/[COUNT]
```
and all countries at 
```
/api/co2/countries
/api/pop/countries
```
(Although these last two responses match, it isn't obvious they do as they are derived from separate datasets.)

The frontend is built with create-react-app. It mostly combines react-select and graph.js.

## How does it stay updated? 

In its current state, the app depends on Heroku's 24 hour restart cycle for reloading its data into memory. If at the time of restart the World Bank API is not available, a backup is loaded instead. 

### Loaded into memory? Why does it not use a database?

In its current state the app runs on a single dyno, and the size of the data is under one megabyte. A database seems overkill to me. I played around with a free Heroku PostgreSQL database, but ultimately decided to keep the application simple instead since it works perfectly as is.
