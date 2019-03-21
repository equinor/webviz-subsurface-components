/* eslint no-magic-numbers: 0 */
import React, {Component} from 'react';
import HistoryMatchDemo  from './HistoryMatchDemo';
import MorrisDemo  from './MorrisDemo';


class App extends Component {

    constructor(props) {
        super(props)
        this.state = {value:'HistoryMatch'}
    }

    onChange(e) {
        this.setState({value: e.target.value})
    }

    renderDemo() {
        switch(this.state.value) { 
            case "HistoryMatch": { 
                return <HistoryMatchDemo/>
            }
            case "Morris": { 
                return <MorrisDemo/>
            }
            default: { 
                return null           
            } 
       }
    }
    
    render() {
        return (
            <div>
                <select value={this.state.value} onChange={this.onChange.bind(this)} >
                    <option value = "HistoryMatch">HistoryMatch</option>
                    <option value = "Morris">Morris</option>
                    
                </select>
                {this.renderDemo()}
            </div>
        )
    }
}

export default App;
