import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Scene from '../private_components/view3d_resources'

const parseData = data => (typeof data === 'string' ? JSON.parse(data) : data);

const getDashProps = wrappedProps => {
    let dashProps
    if (
            wrappedProps._dashprivate_layout &&
            wrappedProps._dashprivate_layout.props
        ) {
            // props are coming from Dash
            dashProps = wrappedProps._dashprivate_layout.props;
          }
    else {
            // else props are coming from React (Demo.react.js, or Tabs.test.js)
            dashProps = wrappedProps;
         }
    return dashProps
}

class View3D extends Component {

    constructor(props) {
        super(props);
        this.scene3D = null
        this.floatText = this.floatText.bind(this)
    }

    componentDidMount() {
        let id = this.props.id
        const canvasId = document.getElementById(id+'canvas');
        const selectedId = document.getElementById(id+'selected');
        this.scene3D = new Scene(
            canvasId,
            selectedId,
            this.props.center_x,
            this.props.center_y,
            this.floatText
        );
        this.scene3D.render();
        let dashProps = getDashProps(this.props);
        if (dashProps.wells) {
            this.scene3D.loadWells(parseData(dashProps.wells));
        }
        if (dashProps.surface) {
            this.scene3D.loadSurfaces(parseData(dashProps.surface));
        }
    }
    componentWillUnmount() {
        console.log('unmounting component')
        this.scene3D.unMount()
    }
    floatText() {
        console.log('okokok')
    }
    componentWillReceiveProps(nextProps) {
        let nProps = getDashProps(nextProps)
        let oProps = getDashProps(this.props)

        const surfaceChanged = oProps.surface !== nProps.surface;
        if (surfaceChanged) {
            this.scene3D.loadSurfaces(parseData(nProps.surface));
        }
        const wellsChanged = oProps.wells !== nProps.wells;
        if (wellsChanged) {
            this.scene3D.loadWells(parseData(nProps.wells));
        }
    }
 render() {
    return (
        <div>

            <div style={{'background-image': 'linear-gradient(#99a, #000)'}} id={this.props.id+'canvas'} key={this.props.id}/>
            <p style={{'text-align':'center'}} id={this.props.id+'selected'}/>
        </div>
    )
  }
}

View3D.defaultProps = {
    height: 800,
};

View3D.propTypes = {
    id: PropTypes.string.isRequired,
    center_x: PropTypes.number.isRequired,
    center_y: PropTypes.number.isRequired,
    surface: PropTypes.object,
    wells: PropTypes.object,


};

export default View3D;
