/* eslint no-magic-numbers: 0 */
import React, {Component} from 'react';
import HistoryMatchDemo  from './HistoryMatchDemo';
import MorrisDemo  from './MorrisDemo';
import SubsurfaceMapDemo  from './SubsurfaceMapDemo';
import View3DDemo  from './View3DDemo';

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {value:'SubsurfaceMap'}
    }

    onChange(e) {
        this.setState({value: e.target.value})
    }

    renderDemo() {
        switch(this.state.value) {
            case "View3D": {
                return <View3DDemo/>
            }
            case "Morris": {
                return <MorrisDemo id = {'test2'}/>
            }
            case "SubsurfaceMap": {
                return <SubsurfaceMapDemo/>
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
                    <option value = "View3D">View3D</option>
                    <option value = "Morris">Morris</option>
                    <option value = "SubsurfaceMap">SubsurfaceMap</option>

                </select>
                {this.renderDemo()}
            </div>
        )
    }
}

export default App;
