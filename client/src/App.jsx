import React, { Component } from 'react';
import './styles/App.css';
import Dropdown from './components/Dropdown';
import { Chart } from './components/Chart';
import { dataFetcher, countryFetcher, topFetcher } from './data';
import Footer from './components/Footer';
import Header from './components/Header';
import Top5 from './components/Top5';
import Options from './components/Options';

// Displayed while the app is loading
const Loading = () => (
  <h2>Loading...</h2>);

// Displayed if the app encounters an error
const Errored = () => (<h2>There was a problem fetching data from the database</h2>);

class App extends Component {
  constructor(props) {
    super(props);
    this.onSelectionChanged = this.onSelectionChanged.bind(this);
    this.onPerCapitaChanged = this.onPerCapitaChanged.bind(this);

    this.state = {
      top5: [],
      top5PerCapita: [],
      status: 'loading',
      selectedCountries: [],
      isDataLoaded: true,
      isPerCapitaSelected: false,
      countryList: [],
    };
  }

  /**
   * Loads initial information about existing countries
   */
  async componentDidMount() {
    const countryFetch = countryFetcher();
    const top5Fetch = topFetcher('/api/co2/top/', 5);
    const top5perCapitaFetch = topFetcher('/api/co2/toppercapita/', 5);

    let countryList = [];
    let top5 = [];
    let top5PerCapita = [];

    try {
      countryList = await countryFetch;
      top5 = await top5Fetch;
      top5PerCapita = await top5perCapitaFetch;
    } catch (err) {
      this.setState({ status: 'errored' });
      // console.log(err);
      return;
    }


    // Used for easier searches of countries (hashmap)
    this.countryLookup = new Map(countryList.map(
      obj => [obj.value, { value: obj.value, label: obj.label }],
    ));

    const defaultValue = [this.countryLookup.get('USA'), this.countryLookup.get('CHN')];

    // Set defaults for the chart
    this.onSelectionChanged(defaultValue);

    this.setState({
      top5, top5PerCapita, countryList,
    });
  }

  /**
   * Called on selection change, fetches data using data.js
   * @param {[{value: "x", label: "y"}]} countries
   */
  async onSelectionChanged(countries) {
    const { isDataLoaded } = this.state;

    if (!isDataLoaded) return;

    this.setState({
      selectedCountries: countries,
      isDataLoaded: false,
    });

    window.scrollTo(0, 0);

    // Await so that the overall promise only resolves once everything is done
    await dataFetcher(countries).then(charts => (
      this.setState({
        chartData: charts.data,
        chartDataPerCapita: charts.dataPerCapita,
        chartLabels: charts.labels,
        isDataLoaded: true,
        status: 'loaded',
      })
    )).catch(() => (
      this.setState({
        status: 'errored',
      })
    ));
  }

  /**
   * Called on change in "per capita" setting
   * @param {} event
   */
  onPerCapitaChanged(event) {
    const { isDataLoaded } = this.state;
    if (!isDataLoaded) return;
    this.setState({
      isPerCapitaSelected: event.target.checked,
    });
  }

  render() {
    const {
      status,
      selectedCountries,
      isPerCapitaSelected,
      isDataLoaded,
      top5,
      top5PerCapita,
      chartData,
      chartDataPerCapita,
      chartLabels,
      countryList,
    } = this.state;

    let app = (<Loading />);

    if (status === 'loaded') {
      const finalChartData = isPerCapitaSelected ? chartDataPerCapita : chartData;
      const overlayMode = (isDataLoaded && selectedCountries.length > 0) ? 'none' : 'block';
      app = (
        <div className="App">
          <Header title="CO2 emissions by country and region" link="https://github.com/emidah/co2-finder" />
          <div className="Dropdown">
            <Dropdown
              selected={selectedCountries}
              options={countryList}
              maxValues={5}
              onChange={this.onSelectionChanged}
              isDisabled={!isDataLoaded}
            />
          </div>
          <div className="flex-container">
            <div className="Chart tile">
              <Chart
                labels={chartLabels}
                datasets={finalChartData}
              />
              <div className="overlay" style={{ display: overlayMode }} />
            </div>
            <div className="Options tile">
              <Options
                onPerCapitaChanged={this.onPerCapitaChanged}
                isPerCapitaSelected={isPerCapitaSelected}
              />
              <div className="overlay" style={{ display: overlayMode }} />
            </div>
          </div>
          <div className="top5-container">
            <div className="top5 top5-child tile">
              <Top5
                top5={top5}
                title={`Top emitters (kt, ${top5[0].year})`}
                onButtonClicked={() => {
                  if (!isDataLoaded) return;
                  this.onSelectionChanged(top5).then(() => {
                    this.setState({
                      isPerCapitaSelected: false,
                    });
                  });
                }}
              />
            </div>
            <div className="top5PerCapita top5-child tile">
              <Top5
                top5={top5PerCapita}
                title={`Top emitters per capita (kt, ${top5PerCapita[0].year})`}
                onButtonClicked={() => {
                  if (!isDataLoaded) return;
                  this.onSelectionChanged(top5PerCapita).then(() => {
                    this.setState({
                      isPerCapitaSelected: true,
                    });
                  });
                }}
              />
            </div>
          </div>
          <div className="Footer">
            <Footer />
          </div>
        </div>
      );
    } else if (status === 'errored') {
      app = (<Errored />);
    }
    return app;
  }
}

export default App;
