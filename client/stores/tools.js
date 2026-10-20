import { observable, action, autorun, computed } from "mobx";
import { GET, POST, PUT } from "../lib/connect";
import moment from "moment";
// import Meteor from '@meteorrn/core';

import _ from "lodash";

class Tools {
  @observable ready = false;
  @observable searchReady = true;

  @observable loadingCounter = 0;

  @observable searchClinicRows = [];

  @observable names = {};
  @observable shortnames = {};

  @observable units = {};
  @observable unitarrs = {};

  @observable elements = {};
  @observable buttonTexts = {};
  @observable UIText = {};
  @observable recipeData = {};

  @observable unitsPharm = {};
  @observable unitsPrimary = {};
  @observable unitsComplex = {};
  @observable unitsSchedule = {
    freq: {},
    duration: {},
  };

  @observable timers = {};

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;
    this.go();
    autorun(() => {});
  }

  go() {
    this.getUnitsPrimary();
    this.getUnitsPharm();
    this.getUnitsSchedule();
    this.getObject("buttonTexts");
    this.getObject("elements");
    this.getObject("UIText");
    // this.getObject('recipeData');
  }
  async getObject(name) {
    let { active_language } = this;
    return POST({
      path: `info/${name}`,
      data: {
        active_language,
      },
      success: async (data) => {
        let { alert, ...values } = data;
        //this[name]
        Object.assign(this[name], { ...values });
        // console.log(this[name]);
      },
      fail: (alerts) => {
        this.loading = false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        // this.stores.actions.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  async getUnitsPharm(units) {
    units = units || [];
    let { active_language } = this.stores.actions;
    let data = {
      units,
      active_language,
    };
    data.authkey = this.stores.user.authkey;
    data.key = this.stores.actions.privateKey;
    // console.log({data});
    return POST({
      path: `tools/UnitsPharm`,
      data,
      success: async (data) => {
        // console.log(`tools/UnitsPharm`, data);
        let { names, nameshort, units, unitrefs, unitpharm } = data || {};
        // console.log({units});
        if (units && _.size(units) > 0) {
          if (units[250 || units[99]]) {
            names[99] = "процент";
            nameshort[99] = "%";
            unitpharm.push(99);
            units[99] = _.cloneDeep(units[250]);
            units[99][0].value = 10;
          }
          // end kostyl

          await this.setNames(names, nameshort);
          this.setUnits(units, unitrefs, unitpharm);
        }
        // kostyl
        // if(units[99])

        this.stores.actions.loading = false;
      },
      fail: (alerts) => {},
      always: (data) => {
        // this.stores.actions.makeAlerts(data);
      },
    });
  }

  async stepByStepLoading(fn, arr) {
    if (this.loadingCounter < arr.length) {
      this.loading = true;
      // console.log(arr[this.loadingCounter]);
      await fn(arr[this.loadingCounter]);
      this.loadingCounter++;
      return this.stepByStepLoading(fn, arr);
    } else {
      this.loadingCounter = 0;
      this.loading = false;
      return true;
    }
    // return this.stepByStepLoading( fn, arr )
  }

  async getUnitsPrimary() {
    let { active_language } = this.stores.actions;
    let data = {
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `tools/UnitsPrimary`,
      data,
      success: async (data) => {
        let { names, nameshort, units, unitrefs } = data;
        //this.setNames(names, nameshort)
      },
      fail: (alerts) => {},
      always: (data) => {
        // this.stores.actions.makeAlerts(data);
      },
    });
  }

  async getUnitsComplex(units) {
    let { active_language } = this.stores.actions;
    let data = {
      units: units,
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `tools/UnitsComplex`,
      data,
      success: async (data) => {
        // console.log('DATA', data);
      },
      fail: (alerts) => {},
      always: (data) => {
        // this.stores.actions.makeAlerts(data);
      },
    });
  }

  async getUnitsSchedule() {
    let { active_language } = this.stores.actions;
    let data = {
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `info/Schedule`,
      data,
      success: async (data) => {
        // console.log('DATA', data);
        let { freq, duration } = data;
        this.unitsSchedule.freq = freq;
        this.unitsSchedule.duration = duration;
      },
      fail: (alerts) => {},
      always: (data) => {},
    });
  }

  getBaseUnit = (unitId) => {
    // console.log({unitId, units: this.units});
    let unit = this.units[unitId];
    // console.log({unit});
    return unit.arr;
  };

  getBaseUnitForComplex = (unitId) => {
    // console.log({unitId, units: this.units});
    let unit = this.units[unitId];
    let unitForComplex = null;
    // console.log({contains: unit.contains});
    if (unit.type == "complex") {
      unit.contains.forEach((item, i) => {
        if (item.action == "multiplication") {
          unitForComplex = item.id;
        }
      });
    }
    return unit.type == "complex" ? unitForComplex : unitId;
  };

  setUnits = (units, unitrefs, unitpharm) => {
    // _.keys(unitrefs).forEach( refkey => {
    //   this.unitarrs.push([ refkey, ...unitrefs[refkey] ])
    // })
    // console.log({ unitpharm });
    _.keys(units).forEach((unitkey) => {
      let unit = units[unitkey];
      let newunit = {
        name: this.names[unitkey],
        shortname: this.shortnames[unitkey],
        contains: unit,
        id: unitkey,
        type: "simple",
        arr: null,
        show: unitpharm.includes(unitkey) || false,
      };

      if (unitrefs[unitkey])
        this.unitarrs[unitkey] = newunit.show ? [unitkey, ...unitrefs[unitkey]] : unitrefs[unitkey];
      if (unit.length < 1) {
        newunit.type = "base";

        newunit.arr = unitkey;
      } else if (unit.length > 1) {
        newunit.type = "complex";
        _.keys(unitrefs).forEach((refkey) => {
          if (unitrefs[refkey].includes(unitkey)) newunit.arr = refkey;
        });
      } else {
        _.keys(unitrefs).forEach((refkey) => {
          if (unitrefs[refkey].includes(unitkey)) newunit.arr = refkey;
        });
      }

      if (unitrefs[unitkey]) {
        // this.unitarrs[unitkey] = (newunit.show ? [ unitkey, ...unitrefs[unitkey] ] : unitrefs[unitkey])
        this.unitarrs[unitkey] = [unitkey, ...unitrefs[unitkey]];
      }
      // if(unitkey === '42'){
      //   console.log(newunit);
      // }
      // if(unitkey === '42') console.log(this.unitarrs[unitkey]);
      this.units[unitkey] = newunit;
    });
    // console.log(this.units);
  };

  getUnitArr = (unitId) => {
    let result = {};
    // console.log({unitId});
    // console.log('unitarrs', this.unitarrs);
    // console.log(this.units[unitId]);
    if (this.units[unitId] && this.units[unitId].arr && this.unitarrs[this.units[unitId].arr]) {
      // console.log('here', this.unitarrs[this.units[unitId].arr]);
      this.unitarrs[this.units[unitId].arr].forEach((arrKey) => {
        // console.log({ type1: this.units[unitId].type, type2: this.units[arrKey].type});
        if (this.units[unitId].type === this.units[arrKey].type || this.units[arrKey].type !== "complex") {
          result[arrKey] = this.units[arrKey];
        }
      });
    }
    // console.log(result);
    return result;
  };

  async searchClinic(text) {
    this.searchReady = false;
    let { active_language } = this.stores.actions;
    let data = {
      text,
      // lib: '62, 52', //'61, 25' - заболевания
      // service: "43",
      // chain: 0
      active_language,
      limit: 20,
    };

    // "key": "string",
    // "text": "string",
    // "lib": "string",
    // "chain": 0,
    // "security_key": "string",
    // "authkey": "string",
    // "limit": 0

    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;

    this.searchClinicRows = observable([]);

    return POST({
      path: `search/Clinics`,
      data,
      success: async (data) => {
        // console.log(data);
        if (data && data.concepts) {
          data.concepts.forEach((item, i) => {
            this.searchClinicRows.push(item);
          });
        }
        this.searchReady = true;
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

  async setNames(names, shortnames) {
    this.names = await _.extend(this.names, names);
    if (shortnames) this.shortnames = await _.extend(this.shortnames, shortnames);
  }

  round = (val, dec = 3) => {
    let delimiter = Math.pow(10, dec);
    return Math.floor(val * delimiter) / delimiter;
  };

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  startTimer = (fn, startFrom = 100, multiplicator = 2, maxVal = 5000, isSelf = false) => {
    let id = this.getRandomInt(1000);

    if (this.timers[id] && !isSelf) return this.startTimer(fn, startFrom, multiplicator, maxVal);

    if (!this.timers[id]) {
      this.timers[id] = {
        isActive: true,
        time: startFrom,
        fn,
      };
    }
    return {
      stop: () => {
        this.timers[id].isActive = false;
      },
      timer: this.recursiveTimer(fn, (startFrom = 100), (multiplicator = 2), (maxVal = 5000), (isSelf = false), id),
    };
  };

  recursiveTimer = async (fn, startFrom = 100, multiplicator = 2, maxVal = 5000, isSelf = false, id) => {
    if (!(this.timers[id] && this.timers[id].isActive)) {
      fn();
      delete this.timers[id];
      return true;
    }

    await this.timeout(startFrom);
    fn();
    return this.recursiveTimer(
      fn,
      startFrom * multiplicator > maxVal ? maxVal : startFrom * multiplicator,
      multiplicator,
      maxVal,
      true
    );
  };

  timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  meteorAsyncCall = async (name, params) => {
    return new Promise((resolve, reject) =>
      Meteor.call(name, params, (err, res) => {
        resolve({ res, err });
        // if (res) resolve({res, err});
        // if (err) reject({res, err});
      })
    );
  };
}
export default Tools;
