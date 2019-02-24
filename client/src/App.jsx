import React, { Component } from 'react';
import './App.css';
import Dropdown from './Dropdown';
import { Chart } from './Chart';
import { dataFetcher, countryFetcher, topFetcher } from './data';
import {
  Top5, Options, Footer,
} from './simpleComponents';

// Displayed while the app is loading
const Loading = () => (
  <h2>Loading...</h2>);

// Displayed if the app encounters an error
const Errored = () => (<h2>There was a problem fetching data from the database</h2>);

class App extends Component {
  constructor(props) {
    super(props);
    this.chartData = [];
    this.chartDataPerCapita = [];
    this.chartLabels = [];
    this.onSelectionChanged = this.onSelectionChanged.bind(this);
    this.onPerCapitaChanged = this.onPerCapitaChanged.bind(this);

    this.state = {
      status: 'loading',
      selectedCountries: [],
      isDataLoaded: false,
      isPerCapitaSelected: false,
    };
  }

  /**
   * Loads initial information about existing countries
   */
  async componentDidMount() {
    const countryFetch = countryFetcher();
    const top5Fetch = topFetcher('/api/co2/top/', 5);
    const top5perCapitaFetch = topFetcher('/api/co2/toppercapita/', 5);

    countryFetch.catch(() => {
      this.setState({ status: 'errored' });
      // console.log(err);
    });

    top5Fetch.catch(() => {
      this.setState({ status: 'errored' });
      // console.log(err);
    });

    top5perCapitaFetch.catch(() => {
      this.setState({ status: 'errored' });
      // console.log(err);
    });

    this.countryList = await countryFetch;
    this.top5 = await top5Fetch;
    this.top5PerCapita = await top5perCapitaFetch;

    // Used for easier searches of countries (hashmap)
    this.countryLookup = new Map(this.countryList.map(
      obj => [obj.value, { value: obj.value, label: obj.label }],
    ));

    // Set defaults for the dropdown
    this.defaultValue = [this.countryLookup.get('USA'), this.countryLookup.get('CHN')];
    // Set defaults for the chart
    this.onSelectionChanged(this.defaultValue);

    this.setState({ status: 'loaded' });
  }


  /**
   * Called on selection change, fetches data using data.js
   * @param {[{value: "x", label: "y"}]} countries
   */
  async onSelectionChanged(countries) {
    this.setState({
      selectedCountries: countries,
      isDataLoaded: false,
    });

    try {
      const charts = await dataFetcher(countries);

      this.chartData = charts.data;
      this.chartDataPerCapita = charts.dataPerCapita;
      this.chartLabels = charts.labels;

      this.setState({
        isDataLoaded: true,
      });
    } catch (err) {
      this.setState({
        status: 'errored',
      });
    }
  }

  /**
   * Called on change in "per capita" setting
   * @param {} event
   */
  onPerCapitaChanged(event) {
    this.setState({
      isPerCapitaSelected: event.target.checked,
    });
  }

  render() {
    const {
      status, selectedCountries, isPerCapitaSelected, isDataLoaded,
    } = this.state;

    let app = (<Loading />);

    if (status === 'loaded') {
      const chartData = isPerCapitaSelected ? this.chartDataPerCapita : this.chartData;
      const overlayMode = (isDataLoaded && selectedCountries.length > 0) ? 'none' : 'block';
      app = (
        <div className="App">
          <h1>CO2 emissions by country and region</h1>
          <div className="Dropdown">
            <Dropdown
              selected={selectedCountries}
              options={this.countryList}
              maxValues={5}
              onChange={this.onSelectionChanged}
              isDisabled={!isDataLoaded}
              defaultValue={this.defaultValue}
            />
          </div>
          <div className="flexContainer">
            <div className="Chart tile">
              <Chart
                labels={this.chartLabels}
                datasets={chartData}
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
                top5={this.top5}
                title={`Top emitters (kt, ${this.top5[0].year})`}
                onButtonClicked={() => {
                  this.onSelectionChanged(this.top5);
                  this.setState({
                    isPerCapitaSelected: false,
                  });
                }}
              />
            </div>
            <div className="top5PerCapita top5-child tile">
              <Top5
                top5={this.top5PerCapita}
                title={`Top emitters per capita (kt, ${this.top5[0].year})`}
                onButtonClicked={() => {
                  this.onSelectionChanged(this.top5PerCapita);
                  this.setState({
                    isPerCapitaSelected: true,
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
