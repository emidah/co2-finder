import axios from 'axios';

/**
 * Gets year labels by checking the years that exist as properties in both datasets.
 * @param {} data1
 * @param {} data2
 */
const getYearLabels = (data1, data2) => {
  const labels = [];
  // Loop until found a field doesn't exist anymore: as of writing, this is "2019"
  if (data1.length > 0 && data2.length > 0) {
    for (let i = 1960; i < 2100; i += 1) {
      if (typeof data1[0][i] === 'undefined' || typeof data2[0][i] === 'undefined') continue;
      labels.push(String(i));
    }
  }
  return labels;
};

/**
 * Fetches data from the set address based on given countries
 * @param {string} address
 * @param { [{ value: "CDE" }] } values
 */
const pullToData = async (address, values) => {
  const promises = values.map(val => (
    axios.get(address + val.value)));
  // make sure array is sorted the same as input
  return (await Promise.all(promises)).map(val => val.data);
};
/**
 * fetches all countries from server
 * data in format Object {value: "USA", label: "United States"}
 */
const countryFetcher = async () => {
  let countryList = [];
  await axios.get('/api/co2/countries')
    .then((response) => {
      countryList = response.data;
      countryList.sort((a, b) => a.label.localeCompare(b.label));
    });
  return countryList;
};

const topFetcher = async (address, count) => {
  const res = await axios.get(address + count);
  const { data } = res;
  let max = 2010;
  for (let i = 2100; i > 2000; i -= 1) {
    if (typeof data[0][i] !== 'undefined' && data[0][i] !== '') {
      max = i;
      break;
    }
  }

  return data.map(x => ({
    value: x['Country Code'],
    label: x['Country Name'],
    year: max,
    emissions: x[max],
  }));
};

/**
 * Fetches data and converts it to chartjs-appropriate format
 * @param {*} values
 */
const dataFetcher = async (values) => {
  let co2data = [];
  let popdata = [];

  const co2pull = pullToData('/api/co2/countries/', values);
  const poppull = pullToData('/api/pop/countries/', values);

  co2data = await co2pull;
  popdata = await poppull;


  co2data.sort((a, b) => {
    const aval = values.findIndex(x => x.value === a['Country Code']);
    const bval = values.findIndex(x => x.value === b['Country Code']);
    if (aval > bval) return 1;
    if (aval < bval) return -1;
    return 0;
  });


  popdata.sort((a, b) => {
    const aval = values.findIndex(x => x.value === a['Country Code']);
    const bval = values.findIndex(x => x.value === b['Country Code']);
    if (aval > bval) return 1;
    if (aval < bval) return -1;
    return 0;
  });

  // Chart needs labels. Only years where both datas are found are valid.
  const chartLabels = getYearLabels(co2data, popdata);

  const chartData = {
    labels: chartLabels,
    data: [],
    dataPerCapita: [],
  };

  co2data.forEach((entry) => {
    const data = [];
    const perCapData = [];

    const pop = popdata.find(x => x['Country Code'] === entry['Country Code']);

    for (let i = 1960; i < 2100; i += 1) {
      if (typeof entry[i] === 'undefined' || typeof pop[i] === 'undefined') continue;
      if (entry[i] === '' || pop[i] === '') {
        data.push(undefined);
        perCapData.push(undefined);
      } else {
        data.push(entry[i]);
        const perc = parseFloat(entry[i]) / parseFloat(pop[i]);
        perCapData.push(perc);
      }
    }

    chartData.data.push(
      {
        label: entry['Country Name'],
        backgroundColor: 'rgba(0, 0, 0, 0)',
        data,
      },
    );

    chartData.dataPerCapita.push(
      {
        label: `${entry['Country Name']} (per capita)`,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        data: perCapData,
      },
    );
  });

  return chartData;
};

export {
  countryFetcher, dataFetcher, pullToData, topFetcher, getYearLabels,
};
