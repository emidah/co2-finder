import React, { Component } from 'react';
import './App.css';
import Dropdown from './Dropdown'
import {Chart} from './Chart'
import { dataFetcher, countryFetcher, topFetcher } from './data';
import {Top5, Options, Footer, Top5PerCapita} from './simpleComponents' 

// Displayed while the app is loading
const Loading = () => (
<h2>Loading...</h2>);

// Displayed if the app encounters an error
const Errored = () => (<h2>There was a problem fetching data from the database</h2>)

// The main displayed page
const Loaded = (props) => {

  return(
  <div className="App">
    <h1>CO2 emissions by country and region</h1>
    <div className='Dropdown'>
      <Dropdown 
        options={props.options} 
        maxValues={5} 
        onChange={props.onChange}
        isDisabled={!props.dataLoaded}
        defaultValue={props.defaultValue}/>
    </div>
    <div className="flexContainer">
      <div className="Chart tile">
        <Chart labels={props.labels} 
        datasets={props.chartData}/>
      </div>
      <div className="Options tile">
        <Options onPerCapitaChanged={props.onPerCapitaChanged} />
      </div>
    </div>
    <div className="top5-container">
      <div className="top5 top5-child tile">
          <Top5 top5={props.top5}/>
      </div>
      <div className="top5PerCapita top5-child tile">
        <Top5PerCapita top5={props.top5PerCapita} /> 
      </div>
    </div>
    <div className="Footer">
      <Footer />
    </div>
  </div>
)}

class App extends Component {

  constructor(props){
    super(props)
    this.chartData = []
    this.chartDataPerCapita = []
    this.chartLabels = []

    this.state = {
      status: "loading",
      selectedCountries: [],
      dataLoaded: false,
      isPerCapitaSelected: false,
    }

  }
  
  /**
   * Loads initial information about existing countries
   */
  async componentDidMount(){
    const countryFetch = countryFetcher()
    const top5Fetch = topFetcher('/api/co2/top/', 5)
    const top5perCapitaFetch = topFetcher('/api/co2/toppercapita/', 5)
  
    countryFetch.catch((err) => {
      this.setState({status: "errored"});
      console.log(err)
    })

    top5Fetch.catch((err) => {
      this.setState({status: "errored"});
      console.log(err)
    })

    top5perCapitaFetch.catch((err) => {
      this.setState({status: "errored"});
      console.log(err)
    })

    this.countryList = await countryFetch
    this.top5 = await top5Fetch
    this.top5PerCapita = await top5perCapitaFetch

    // Used for easier searches of countries (hashmap)
    this.countryLookup = new Map( this.countryList.map( 
      obj => [obj.value, {value: obj.value, label: obj.label}]
      ));

    // Set defaults for the dropdown
    this.defaultValue = [this.countryLookup.get("USA"), this.countryLookup.get("CHN")]
    // Set defaults for the chart
    this.onSelectionChanged(this.defaultValue)

    this.setState({status: "loaded"});
  }


  /**
   * Called on selection change, fetches data using data.js
   * @param {[{value: "x", label: "y"}]} countries 
   */
  async onSelectionChanged(countries){

    this.setState({
      selectedCountries: countries,
      isDataLoaded: false
    });

    try {
      const charts = await dataFetcher(countries)

      this.chartData = charts.data
      this.chartDataPerCapita = charts.dataPerCapita
      this.chartLabels = charts.labels

      this.setState({
        isDataLoaded: true
      });

    } catch (err) {
      this.setState({
        status: "errored"
      })
      console.log(err)
    }
    
  }
  
  /**
   * Called on change in "per capita" setting
   * @param {} event 
   */
  onPerCapitaChanged(event){
    this.setState({
      isPerCapitaSelected: event.target.checked,
    });
  }

  render() {
    let app = (<Loading/>);
    if(this.state.status === "loaded"){
      const chartData = this.state.isPerCapitaSelected ? this.chartDataPerCapita : this.chartData

      app = (
      <Loaded 
        options={this.countryList} 
        onChange={this.onSelectionChanged.bind(this)} 
        chartData={chartData}
        dataLoaded={this.state.isDataLoaded}
        labels={this.chartLabels}
        defaultValue={this.defaultValue}
        onPerCapitaChanged={this.onPerCapitaChanged.bind(this)}
        top5={this.top5}
        top5PerCapita={this.top5PerCapita}/>
        );

    } else if (this.state.status === "errored"){
      app = (<Errored/>)
    }
    return app;
  }

}

export default App;
