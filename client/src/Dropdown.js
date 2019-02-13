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
        this.defVal = this.state.options.find(item => {
            return item.value === "WLD"
        });
    }

    onChange = (values) => {
        console.log(values)
        if (values.length > 4){
        this.setState({
            full: true
        });
        
        } else {
        this.setState({
            full: false,
            selected: values
        });
        }
    }

    render(){
        return (
            <Select
            value={this.state.selected}
            onChange = {this.onChange.bind(this)}
            defaultValue={this.defVal}
            isMulti
            name={"countries"}
            options={this.state.options}
            className="basic-multi-select"
            classNamePrefix="select"
        />)
    }

}




export default Dropdown 