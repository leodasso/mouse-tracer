import React, {Component} from 'react';
import { connect } from 'react-redux';
import Sketch from '../Sketch/Sketch';

class SketchList extends Component {

    componentDidMount() {

        this.props.dispatch({type:'FETCH_SKETCHES'})

    }

    render() {

        console.log(this.props);
        return (
            <div className="SketchList">
                {this.props.sketches.map(sketch => <Sketch sketchData={sketch}/>)}
            </div>
        );
    }
}

const mapReduxState = (reduxState) => {
    return reduxState;
}

export default connect(mapReduxState)(SketchList);