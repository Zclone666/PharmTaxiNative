import React, { Component } from 'react';
import { Provider, observer } from 'mobx-react';
import stores from './stores';
import Layout from './Layout'
// import Spinner from './spinner';
import { PROJECT_TITLE } from './lib/connect'
//import './lib/semantic-ui/semantic.import.less'
//import './index.less'; 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

@observer
class App extends Component {
  componentDidMount(){
    document.title = PROJECT_TITLE
  }
  render() {
    return (
      <Provider {...stores}>
        {/*<Spinner>*/}
            <Layout />
        {/*</Spinner>*/}
      </Provider>
    );
  }
}
export default App
