import React, { Component } from 'react'
import Select from 'react-select'

class Dropdown extends Component{

    constructor(props) {
        super(props)

        this.state = {
            selected: props.defaultValue,
            full: false,
        }
    }

    onChange = (values) => {
        //console.log(values)
        
        // Make sure it's impossible to pick more than max
        if (values.length > (this.props.maxValues || 99)){
            this.setState({
                full: true
            });
        } else {
            this.setState({
                selected: values,
                full: false
            });

            if(values.length === this.props.maxValues){
                this.setState({
                    full: true
                });
            }   
            if (typeof this.props.onChange === 'function') this.props.onChange(values)
        }
        

    }

    render(){
        let options = this.props.options
        if(this.state.full) options = []
        return (
            <Select
            value={this.state.selected}
            onChange = {this.onChange.bind(this)}
            defaultValue={this.props.defaultValue}
            isMulti
            name={"countries"}
            options={options}
            className="basic-multi-select"
            classNamePrefix="select"
            isDisabled={this.props.isDisabled}
        />)
    }

}

export default Dropdown 