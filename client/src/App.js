import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import Dropdown from './Dropdown'
import Chart from './Chart'


const Loading = () => (
<h2>Loading...</h2>);

const Errored = () => (<h2>There was a problem fetching data from the database</h2>)

const Options = (props) => (
  <div>
    <h3>Options</h3>
    <label>
      <input type="checkbox" onChange={props.perCapitaChanged}/>
      &nbsp;Per capita
    </label>
  </div>
)

const Footer = (props) => (
  <div>
    <p>This website uses <a href="https://data.worldbank.org/">World Bank</a> <a href="https://data.worldbank.org/indicator/EN.ATM.CO2E.KT">CO2 emissions</a> and <a href="https://data.worldbank.org/indicator/SP.POP.TOTL">population</a> data under the Creative Commons 4.0 license.</p>
  </div>
)

const Loaded = (props) => (
  <div className="App">
    <h1>CO2 data by country</h1>
    <div className='Dropdown'>
      <Dropdown 
        options={props.options} 
        maxValues={5} 
        onChange={props.onChange}
        isDisabled={!props.dataLoaded}
        defaultValue={props.defaultValue}/>
      </div>
    <div className="Chart">
      <Chart labels={props.labels} 
      datasets={props.chartData}/>
    </div>
    <div className="Options">
      <Options perCapitaChanged={props.perCapitaChanged} />
    </div>
    <div className="Footer">
      <Footer />
    </div>
  </div>
)

class App extends Component {

  constructor(props){
    super(props)
    const self = this
    this.chartData = []
    this.chartDataPerCapita = []
    this.chartLabels = []

    this.state = {
      status: "loading",
      selected: [],
      dataLoaded: true,
      perCapita: false,
    }

    axios.get('/api/co2/countries')
    .then(function (response) {
        self.countryList = response.data
        self.countryList.sort( (a,b) => {return a.label.localeCompare(b.label)})
        self.countryLookup = new Map( response.data.map( 
          obj => [obj.value, {value: obj.value, label: obj.label}]
          ));
        
        // Set selection default values as USA and China
        self.defaultValue = [self.countryLookup.get("USA"), self.countryLookup.get("CHN")]
        self.onSelectionChanged(self.defaultValue)
        
        self.setState({status: "loaded"});
        
    })
    .catch(function (error) {
      self.setState({status: "errored"});
       console.log(error)
    })
    .then(function () {
    });
  }

  onSelectionChanged(values){
    this.setState({
      selected: values,
      dataLoaded: false
    });

    this.dataFetcher(values)
  }

  async dataFetcher(values){
    let co2data = []
    let popdata = []

    const co2pull = this.pullToData('/api/co2/', values, co2data)
    const poppull = this.pullToData('/api/pop/', values, popdata)

    await co2pull
    await poppull

    this.chartData = []
    this.chartDataPerCapita = []
    
    // Chart needs labels. Only years where both datas are found are valid.
    this.chartLabels = []
    if(co2data.length > 0){
      for(let i = 1960; i<2100; i++){
        if (typeof co2data[0][i] === 'undefined' || typeof popdata[0][i] === 'undefined') break;
        this.chartLabels.push(String(i))
      }
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
      
      this.chartData.push(
        {
          label: entry["Country Name"],
          backgroundColor: 'rgba(0, 0, 0, 0)',
          data: data,
        });

      this.chartDataPerCapita.push(
        {
          label: entry["Country Name"] + " (per capita)",
          backgroundColor: 'rgba(0, 0, 0, 0)',
          data: perCapData,
        });
    
    }

    this.setState({
      selected: values,
      dataLoaded: true
    });
  }

  async pullToData(address, values, dest, labelDest){
    const promises = values.map(val => (
      axios.get(address + val.value))
      .then(function(res) {
        dest.push(res.data)
      })
      .catch(function (error) {
        console.log(error)
      })
    );
    await Promise.all(promises)
  }

  perCapitaChanged(event){
    this.setState({
      perCapita: event.target.checked,
    });
  
  }

  render() {
    let app = (<Loading/>);
    if(this.state.status === "loaded"){
      const chartData = this.state.perCapita ? this.chartDataPerCapita: this.chartData

      app = (
      <Loaded 
        options={this.countryList} 
        onChange={this.onSelectionChanged.bind(this)} 
        chartData={chartData}
        dataLoaded={this.state.dataLoaded}
        labels={this.chartLabels}
        defaultValue={this.defaultValue}
        perCapitaChanged={this.perCapitaChanged.bind(this)}/>
        );

    } else if (this.state.status === "errored"){
      app = (<Errored/>)
    }
    return app;
  }

}

export default App;
