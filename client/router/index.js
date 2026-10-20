import { observable, action, autorun } from "mobx";
import { createBrowserHistory } from "history";
import { PRE_PATH } from "../lib/connect";
import Mapper from "url-mapper";
import _ from "lodash";

export default class Router {
  @observable location = null;
  @observable route = null;
  @observable match = null;
  @observable values = {};

  constructor(options) {
    // this.params = observable.map({});
    this.options = {
      routes: {},
    };
    let routes = (options && options.routes) || {};
    _.keys(routes).forEach((key, i) => {
      let newKey = PRE_PATH + key;
      this.options.routes[newKey] = routes[key];
    });
    this.stores = options.stores || {};
    // options.stores.router = this
    this.history = createBrowserHistory({ initialEntries: [window.location.pathname] });
    this.mapper = Mapper();
    this.history.listen(this.onLocation.bind(this));
    this.onLocation(this.history.location);

    autorun(() => {
      if (!this.match) this.push("/");
    });
    autorun(() => {
      // console.log('ROUTER',this.values);
      if (this.values && this.values.page) this.stores.actions.setCurrentPage(this.values.page);
      if (this.values && this.values.license) this.stores.pharms.setCurrentLicense(this.values.license);
      if (this.values && this.values.netId) this.stores.pharms.setPharmNet(this.values.netId);
    });
  }

  @action onLocation(location) {
    // console.log("YES");
    // let oldRoute = this.match;
    // let oldVals = this.values;
    let matchedRoute = this.mapper.map(location.pathname, this.options.routes);
    // console.log(matchedRoute);
    if (!matchedRoute || !matchedRoute.match) return this.push("/");
    let { match, values, route } = matchedRoute;
    if (this.match && match.section == this.match.section && match.section !== "auth") {
      Object.assign(this, { values, route, location });
      this.match.name = match.name;
    } else {
      Object.assign(this, { match, values, route, location });
    }

    // if (this.match.onEnter) this.match.onEnter();
    // if (oldRoute.onExit) oldRoute.onExit();
    // if(oldRoute.name === 'project' && this.match.name === 'project'){
    //   this.stores.client.socket.setPair(this.pairId);
    // }
  }

  setValues(values) {
    let location = this.mapper.stringify(this.route, values);
    if (location !== this.location.pathname) this.push(location);
  }

  push(location) {
    if (this.location && this.location.pathname === location) return;
    this.history.push(PRE_PATH + location);
  }
  replace(location) {
    this.history.replace(location);
  }
  go(n) {
    this.history.go(n);
  }
  goBack() {
    this.history.goBack();
  }
  goForward() {
    this.history.goForward();
  }
  createHref() {
    return this.history.createHref(...arguments);
  }
}
