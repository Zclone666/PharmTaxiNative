import { observable, action, autorun } from "mobx";
import { GET, POST, PUT, PROJECT_TITLE } from "../lib/connect";
import { Meteor } from "meteor/meteor";
// import { Tracker } from "meteor/tracker";
import _ from "lodash";
import moment from "moment";

export const AUTH_SERVICE_KEY = "7e649ecb733d2af1";
export const RESET_PASS_KEY = "c47ee7e666d6be7e";

class Ecp {
  @observable authorized = null;
  @observable searchRows = [];
  @observable searchReady = true;
  @observable current = {};
  @observable info = {};

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;
  }
  async search(text, saveTo = "search") {
    this.searchReady = false;
    let { active_language } = this.stores.actions;
    let data = {
      text,
      lib: "62, 52", //'61, 25' - заболевания
      service: "43",
      chain: 0,
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `search/Drugs`,
      data,
      success: async (data) => {
        if (data.concepts && data.concepts.length > 0 && _.isArray(data.concepts)) {
          await data.concepts.forEach((concept, i) => {
            data.concepts[i].key = "concept" + i;
            data.concepts[i].title = data.concepts[i].name;
          });
          this[`${saveTo}Rows`] = observable([]);
          this[`${saveTo}Rows`] = await _.unionWith(data.concepts, this[`${saveTo}Rows`], (a, b) => a.id === b.id);
          this.searchReady = true;
        } else if (data.concepts && data.concepts.length == 0 && _.isArray(data.concepts)) {
          this[`${saveTo}Rows`] = observable([]);
          this.searchReady = true;
        }
      },
      fail: (alerts) => {
        this.searchReady = true;
        // console.log('fail', alerts);
      },
      always: (data) => {
        // this.stores.actions.makeAlerts(data)
      },
    });
  }

  selectDrug = (drug_obj) => {
    this.current = drug_obj;
    this.ready = false;
    this.stores.actions.loading = true;
    let { active_language } = this.stores.actions;

    let data = {
      drug: drug_obj,
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `drugs/Info`,
      data,
      success: async (data) => {
        let { сalculation, instruction } = data;

        let current = this.info[drug_obj.key] || {};

        let calc = _.orderBy(сalculation, ["sort"], ["asc"]);
        let ins = _.orderBy(instruction, ["sort"], ["asc"]);

        let info = {
          key: drug_obj.key,
          id: drug_obj.id,
          itemsCalc: calc,
          itemsInstr: ins,
        };

        this.info[drug_obj.key] = _.extend(current, info);

        this.ready = true;
        this.stores.actions.loading = false;
      },
      fail: (alerts) => {},
      always: (data) => {},
    });
  };
}
export default Ecp;
