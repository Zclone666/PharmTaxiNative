import React from 'react';

//import { Dropdown } from 'semantic-ui-react'

import Search from '../Search'

class SearchString extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      open: true,
    }
  }

  render(){

    return (
      <Search />
    )
  }

};
export default SearchString
