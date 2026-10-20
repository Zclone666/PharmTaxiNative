import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'


import {
  Sidebar,
  Menu,
  Icon,
  // Search,
  Segment,
  Message,
  List,
  Feed,
  Button,
  Responsive,
  Grid
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('router', 'db', 'actions')
@observer
class Location extends Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,

      isLoading: false,
      searchQuery: ''
    }
    //this.contextRef = createRef()
  }

  saveDoze = () => {

  }

  back = () => {
    this.props.router.push('/')
  };

  render() {
    let shownPage = this.props.router.values && this.props.router.values.page || 'none'
    let section = (this.props.router && this.props.router.match && this.props.router.match.name) || 'none'
    return (
      {

        'none'   : <div />
      }[section] || null
    );
  }
};
export default Location
