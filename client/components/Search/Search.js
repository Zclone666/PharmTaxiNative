import React from 'react';
import cx from 'classnames'
import { Search, SearchResults } from 'semantic-ui-react'

class SearchInput extends Search {
  constructor(props){
    super(props)

  }
  renderResultsMenu = () => {
    const { open } = this.state
    const { resultClassName, height } = this.props
    const resultsClasses = open ? 'visible' : ''
    const menuContent = this.renderMenuContent()
    const classes = cx(resultsClasses, resultClassName)

    if (!menuContent) return

    return (
      <div className={'results transition ' + classes} style={{ height }}>
        <SearchResults className={'visible'}>{menuContent}</SearchResults>
      </div>
    )
  }


};
export default SearchInput
