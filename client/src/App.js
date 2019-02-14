import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import Dropdown from './Dropdown'
import Chart from './Chart'


const Loading = () => (<h2>Loading...</h2>);

const Errored = () => (<h2>There was a problem fetching data from the database</h2>)

const Options = (props) => (
  <p>Test</p>
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
      <Options/>
    </div>
  </div>
)

class App extends Component {

  constructor(props){
    super(props)
    const self = this
    this.chartData = []
    this.labels = []

    this.state = {
      status: "loading",
      selected: [],
      dataLoaded: true
    }

    axios.get('/api/co2/countries')
    .then(function (response) {
        self.countryList = response.data
        self.countryList.sort( (a,b) => {return a.label.localeCompare(b.label)})
        self.countryLookup = new Map( response.data.map( 
          obj => [obj.value, {value: obj.value, label: obj.label}]
          ));
        console.log(self.countryLookup)
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

    this.asyncFetcher(values)
  }

  async asyncFetcher(values){
    this.data = []
    const self = this

    const promises = values.map(val => (
      axios.get('/api/co2/'+ val.value))
      .then(function(res) {
        self.data.push(res.data)
      })
      .catch(function (error) {
        console.log(error)
      })
    );
    await Promise.all(promises)

    this.data.sort( (a,b) => {return a['Country Name'].localeCompare(b['Country Name'])})

    this.chartData = []
    
    this.labels = []
    if(this.data.length > 0){
      for(let i = 1960; i<2100; i++){
        if (typeof this.data[0][i] === 'undefined') break;
        this.labels.push(String(i))
      }
    }

    for(let entry of this.data){
      const data = []
      for(let i = 1960; i<2100; i++){
        if (typeof entry[i] === 'undefined') break;
        if (entry[i] === "") entry[i] = undefined
        data.push(entry[String(i)])
      }

      this.chartData.push(
        {
          label: entry["Country Name"],
          backgroundColor: 'rgba(0, 0, 0, 0)',
          data: data,
      }
      );
    }

    this.setState({
      selected: values,
      dataLoaded: true
    });
  }
  

  render() {
    let app = (<Loading/>);
    if(this.state.status === "loaded"){
      app = (
      <Loaded 
        options={this.countryList} 
        onChange={this.onSelectionChanged.bind(this)} 
        chartData={this.chartData}
        dataLoaded={this.state.dataLoaded}
        labels={this.labels}
        defaultValue={this.defaultValue}/>
        );
    } else if (this.state.status === "errored"){
      app = (<Errored/>)
    }
    return app;
  }

}

export default App;
