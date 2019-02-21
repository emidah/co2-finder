import axios from 'axios';

/**
 * Gets year labels by checking the years that exist in both datasets.
 * @param {} data1 
 * @param {} data2 
 */
const getYearLabels = (data1, data2) => {
    const labels = []
    // Loop until found a field doesn't exist anymore: as of writing, this is "2019"
    if(data1.length > 0 && data2.length > 0){
        for(let i = 1960; i<2100; i++){
          if (typeof data1[0][i] === 'undefined' || typeof data2[0][i] === 'undefined') break;
          labels.push(String(i))
        }
      }
    return labels
}

/**
 * Fetches data from the set address based on given countries
 * 
 * @param {string} address 
 * @param {Array} values 
 */
const pullToData = async (address, values) => {
    const result = [];
    const promises = values.map(val => (
      axios.get(address + val.value))
      .then(function(res) {
        result.push(res.data)
      })
    );
    await Promise.all(promises)
    // make sure array is sorted the same as input
    return result
  }

/**
 * fetches all countries from server
 * data in format Object {value: "USA", label: "United States"}
 */
const countryFetcher = async () => {
  let countryList = []
  await axios.get('/api/co2/countries')
    .then(function (response) {
        countryList = response.data
        countryList.sort( (a,b) => {return a.label.localeCompare(b.label)});       
    })
  return countryList
}

const topCo2Fetcher = async (count) => {
  const res = await axios.get('/api/co2/top/'+count)
  const data = res.data
  let max = 2010
  for(let i = 2010; i<2100; i++){
    if (typeof data[0][i] === 'undefined' || data[0][i] === ''){
      max = i-1;
      break;
    } 
  }

  return data.map(x => ({
    value: x['Country Code'],
    label: x['Country Name'],
    year: max,
    emissions: x[max]
  }));
}

/**
 * Fetches data and converts it to chartjs-appropriate format
 * @param {*} values 
 */
const dataFetcher = async (values) => {

    let co2data = []
    let popdata = []

    const co2pull = pullToData('/api/co2/countries/', values)
    const poppull = pullToData('/api/pop/countries/', values)

    co2data = await co2pull
    popdata = await poppull


    co2data.sort( (a,b) => {
      const aval = values.findIndex( x => x.value === a["Country Code"])
      const bval = values.findIndex( x => x.value === b["Country Code"])
      if (aval > bval) return 1
      if (aval < bval) return -1
      else return 0
    });


    popdata.sort( (a,b) => {
      const aval = values.findIndex( x => x.value === a["Country Code"])
      const bval = values.findIndex( x => x.value === b["Country Code"])
      if (aval > bval) return 1
      if (aval < bval) return -1
      else return 0
    });
    
    // Chart needs labels. Only years where both datas are found are valid.
    const chartLabels = getYearLabels(co2data,popdata)

    const chartData = {
        labels: chartLabels,
        data: [],
        dataPerCapita: []
    }
    
    for(let entry of co2data){

      const data = []
      const perCapData = []

      const pop = popdata.find(x => x["Country Code"] === entry["Country Code"])

      for(let i = 1960; i<2100; i++){
        if (typeof entry[i] === 'undefined' || typeof pop[i] === 'undefined') break;
        if (entry[i] === "" || pop[i] === ""){ 
          data.push(undefined)
          perCapData.push(undefined)
        } else {
          data.push(entry[i])
          const perc = parseFloat(entry[i]) / parseFloat(pop[i])
          perCapData.push(perc)
        }
      }
      
      chartData.data.push(
        {
          label: entry["Country Name"],
          backgroundColor: 'rgba(0, 0, 0, 0)',
          data: data,
        });

      chartData.dataPerCapita.push(
        {
          label: entry["Country Name"] + " (per capita)",
          backgroundColor: 'rgba(0, 0, 0, 0)',
          data: perCapData,
        });
    
    }
    return chartData

}

export {countryFetcher, dataFetcher, pullToData, topCo2Fetcher, getYearLabels}