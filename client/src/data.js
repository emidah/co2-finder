import axios from 'axios';

const getYearLabels = (data1, data2) => {
    const labels = []
    if(data1.length > 0 && data2.length > 0){
        for(let i = 1960; i<2100; i++){
          if (typeof data1[0][i] === 'undefined' || typeof data2[0][i] === 'undefined') break;
          labels.push(String(i))
        }
      }
    return labels
}

const pullToData = async (address, values) => {
    const result = [];
    const promises = values.map(val => (
      axios.get(address + val.value))
      .then(function(res) {
        result.push(res.data)
      })
    );
    await Promise.all(promises)
    return result
  }

const countryFetcher = async (values) => {
  let countryList = []
  await axios.get('/api/co2/countries')
    .then(function (response) {
        countryList = response.data
        countryList.sort( (a,b) => {return a.label.localeCompare(b.label)});       
    })
  return countryList
}

const dataFetcher = async (values) => {

    let co2data = []
    let popdata = []

    const co2pull = pullToData('/api/co2/', values)
    const poppull = pullToData('/api/pop/', values)

    co2data = await co2pull
    popdata = await poppull
    
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

export {dataFetcher, countryFetcher}