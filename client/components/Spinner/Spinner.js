import React from 'react';
import { inject, observer } from 'mobx-react';
import {
  Segment, Dimmer,
} from 'semantic-ui-react';
import Loader from '../Loader';

@inject('actions')
@observer
class Spinner extends React.Component {

  render(){
    let { children, actions: { dataLoading } } = this.props;
    return (
      ((!dataLoading)
      // && this.props.db.ready
     ) ?
        children
        :
        <Loader />
    )
  }

};
export default Spinner
