import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import Dropdown from './Dropdown'


const Loading = () => (<h2>Loading...</h2>);

const Errored = () => (<h2>There was a problem fetching data from the database</h2>)

const Loaded = (props) => {
  // Set "world" as default
  let defVal = props.options.find(item => {
    return item.value === "WLD"
  });

  const onChange = (values) => {
    console.log(values)
    if (values.length > 4){
      props.app.setState({
        full: true
      });
    
    } else {
      props.app.setState({
        full: false,
        selected: values
      });
    }
  }

  console.log("load")

  return (
  <Dropdown name="countries" 
  options={props.options}
  defaultValue={defVal} 
  onChange={onChange} />)
}

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
