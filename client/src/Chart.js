import React, { Component } from 'react';
import {Line} from 'react-chartjs-2';

class Chart extends Component {
    constructor(props){
        super(props)

    }

    render(){
        return( 
            <Line data= {{ labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [{
                    label: "My First dataset",
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderColor: 'rgb(255, 99, 132)',
                    data: [0, 10, 5, 2, 20, 30, 45],
                }]
            }} />
        );
    }
}  

export default Chart