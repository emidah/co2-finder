import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import Dropdown from './Dropdown'
import Chart from './Chart'


const Loading = () => (<h2>Loading...</h2>);

const Errored = () => (<h2>There was a problem fetching data from the database</h2>)

const Loaded = (props) => (
  <div className="App">
    <h1>CO2 data by country</h1>
    <Dropdown options={props.options} maxValues={4}/>
    <div className="Chart">
      <Chart />
    </div>
  </div>
)

class App extends Component {

  constructor(props){
    super(props)
    const self = this
    
    this.app = <Loading/>

    this.state = {
      status: "loading",
      selected: [],
      full: false
    }


    axios.get('/api/co2/countries')
    .then(function (response) {
        self.countryList = response.data
        self.countryLookup = new Map(response.data.value, response.data.label)
        self.app = (
        <Loaded options={self.countryList} app={self}
       />
        );
    })
    .catch(function (error) {
       self.app = <Errored/>
       console.log(error)
    })
    .then(function () {
      self.setState({status: "loaded"});
    });
  }

  
  
  render() {
    console.log(this.state)
    return this.app;
  }

}

export default App;
