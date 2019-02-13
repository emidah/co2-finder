import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Select from 'react-select';
import axios from 'axios';


const Loading = () => (<h2>Loading...</h2>);

const Errored = () => (<h2>There was a problem fetching data from the database</h2>);

const Loaded = () => (<h2>Loaded</h2>)

let countries = []

class App extends Component {
  constructor(props){
    super(props)

    this.app = <Loading/>

    this.state = {status: "loading"}

    const self = this

    axios.get('/api/co2/countries')
    .then(function (response) {
        self.app = <Loaded/>;
        countries = response.data
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
    return this.app;
  }

  async loadCountries(){
  }
}

export default App;
