import React, { Component } from 'react'
import Select from 'react-select'

class Dropdown extends Component{

    constructor(props) {
        super(props)

        this.state = {
            options: props.options,
            selected: "",
            full: false
        }

        // Set "world" as default
        this.defVal = props.defaultValue
        this.maxValues = props.maxValues
    }

    onChange = (values) => {
        //console.log(values)
        
        // Make sure it's impossible to pick more than max
        if (values.length > (this.maxValues || 99)){
            this.setState({
                full: true
            });
        } else {
            this.setState({
                selected: values,
                full: false
            });
        }

        if(values.length == this.maxValues){
            this.setState({
                full: true
            });
        }
    }

    render(){
        let options = this.state.options
        if(this.state.full) options = []

        return (
            <Select
            value={this.state.selected}
            onChange = {this.onChange.bind(this)}
            defaultValue={this.defVal}
            isMulti
            name={"countries"}
            options={options}
            className="basic-multi-select"
            classNamePrefix="select"
        />)
    }

}




export default Dropdown 