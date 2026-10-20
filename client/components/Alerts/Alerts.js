import React from 'react';
import { inject, observer } from 'mobx-react';

import Alert from './Alert';

import _ from 'lodash';

@inject('actions')
@observer
class Alerts extends React.Component {
  onClose = (key) => {
    this.props.actions.alerts = _.omit(this.props.actions.alerts, key);
  }
  render(){
    let { alerts, ...otherProps } = this.props.actions;
    return (
      <div className='alertbox'>
        {_.keys(alerts).map((key, i) => {
          let item = alerts[key]
          return <Alert key={`alert_${key}`} open onClose={() => this.onClose(key)} {...item} />
        })}

      </div>
    )
  }

};
export default Alerts
