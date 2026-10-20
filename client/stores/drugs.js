import { observable, action, autorun, computed, runInAction } from "mobx";
import { GET, POST, PUT } from "../lib/connect";

// import Meteor, {Mongo} from '@meteorrn/core';
//
// import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import moment from "moment";

// import fuzzysort from 'fuzzysort';

// import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";

import _ from "lodash";

import { DrugScheme, LiquidScheme } from "../schemes";

String.prototype.ucfirst = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

const colorPallette = ["#007b2b", "#b0d512", "#03529b", "#fff42b", "#ffca2f", "#fc7301", "#f42a03"];

class Drugs {
  //start-decorators
  @observable ready = false;
  @observable searchRows = [];

  @observable concepts = [];
  @observable letters = [];

  @observable deletedRows = [];
  @observable deletedLiquids = [];

  @observable searchReady = true;

  @observable listChanged = true;

  @observable selectedRows = [];

  @observable scannedDrug = {};

  @observable musthaveList = {};

  @observable current = _.cloneDeep(DrugScheme);
  @observable currLiquid = _.cloneDeep(LiquidScheme);
  //end-decorators

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;
    // makeObservable(this);

    this.drug = observable.map({}, "drug");
    this.liquid = observable.map({}, "liquid");

    autorun(() => {
      // console.log({
      //   drugs: Array.from(this.drug.values()),
      //   liquids: Array.from(this.liquid.values()),
      //   deletedRows: Array.from(this.deletedRows),
      //   deletedLiquids: Array.from(this.deletedLiquids),
      // });
      // console.log(Array.from(this.liquid.values()));
      // this.getConcepts();
    });
    // setTimeout(() => {
    //   this.getConcepts();
    // }, 100);
  }

  getByCode = async (params) => {
    // console.log({params});
    let result = await new Promise((resolve, reject) =>
      Meteor.call("ReadBarcode", params, (err, res) => {
        // console.log(res);
        if (res) resolve(res);
        if (err) reject(err);
      })
    );
    // console.log({result});

    if (result && result.alert && result.alert.code == 200) {
      // await this.stores.druginfo.get(result.drugConcept, false);
      runInAction(() => {
        _.assignIn(this.scannedDrug, result);
      });
      return false;
    } else {
      this.stores.actions.makeAlerts({
        alerts: [
          {
            title: result.title || result.alert.title || "Ошибка",
            message: result.message || result.alert.message || "Не удалось найти информацию",
            level: result.level || "warning",
            sticky: result.level || "warning",
          },
        ],
      });
      return result;
    }

    // if (res && res.alert && res.alert.code == 200) {
    //   // this.stores.router.push()
    //   return true
    // }
  };

  setCurrentFromScan = () => {
    let x = {
      result: {
        _dv_id_short: "2848",
        _tn_id_short: "6254",
        alert: {
          code: 200,
          level: "success",
          message: "Информация была получена не полностью",
          sticky: false,
          title: "Success",
        },
        authenticity: 1,
        batchLot: null,
        batch_number: null,
        code: "04601669005670",
        comment: null,
        concepts: [[Object]],
        deyVesch: "активированный уголь",
        dosage: null,
        drugConcept: {
          fpid: "IZ142O3UvT1wtXN/7DZymA==",
          id: "Xv9XWD/Iw1+e51DBbCEtrQ==",
          key: null,
          level: 240,
          main: false,
          name: "Активированный уголь",
          namesearch: null,
          type: "TN",
        },
        dvIdBig: "sXpGwd8dLCZMUerPcK1tiw==",
        dvIdShort: "2848",
        expiration: "expired",
        expired: false,
        expiry_date: "1575158400000",
        farmForm: null,
        farmFormId: null,
        farmMethod: null,
        farmMethodId: null,
        farmPrep: "Уголь активированный, табл,  250 мг, пач. картон. 5 шт., Фармстандарт-Лексредства (Россия)",
        format: "DATA_MATRIX",
        fpIdBig: "IZ142O3UvT1wtXN/7DZymA==",
        fpIdShort: "23597",
        gtin: "04601669005670",
        hiddenSerial: null,
        identification_number: "04601669005670",
        infoRetrieveLevel: 1,
        isMed: true,
        manuf: null,
        probabilityAcquire: null,
        probabilitySeller: null,
        qty: null,
        raw_code: "01090069680072052111055505",
        regCert: null,
        regCertDate: null,
        regCertStatus: "valid",
        ruReg: true,
        saleDate: null,
        scansCount: null,
        serial_number: "0000000002wu191ee0592hO4M3k9upJBjsOE2e7oP2iOIRK4XoANp8ReRFPkkj8Q=",
        tnIdBig: "Xv9XWD/Iw1+e51DBbCEtrQ==",
        tnIdShort: "6254",
        tnved: null,
        torgName: "Активированный уголь",
        useByOrExpiry: "1575158400000",
        validated: true,
      },
    };
  };

  //drug
  @action
  setCurrent = async ({ drug, key, id }) => {
    let drugTpl = this.getNew();
    drugTpl.key = key;
    drugTpl.id = id;
    _.assignIn(this.current, drugTpl);
    if (!drug && !!key) drug = await this.drug.get(key);
    _.assignIn(this.current, drugTpl, drug);
  };

  @action
  setCurrentField = async (name, value) => {
    runInAction(() => {
      this.current[name] = value;
    });
  };

  @action
  setFromCurrent = async (clear) => {
    let curr = await this.getCurrent();
    let drug = await this.drug.get(curr.key);

    let checkParams = {
      fp_id: null,
      tn_id: null,
      dv_id: null,
    };
    if (curr.type == "TN") checkParams.tn_id = curr.id;
    if (curr.type == "DV") checkParams.dv_id = curr.id;
    if (curr.fpid) checkParams.fp_id = curr.fpid;
    let mustHave = await this.checkMusthave(checkParams);

    runInAction(() => {
      drug = Object.assign(drug, curr);
      this.drug.set(drug.key, _.cloneDeep(drug));
    });

    if (clear) this.unsetCurrent();

    this.stores.pharms.getAvailable(drug);
  };

  @action
  unsetCurrent = () => {
    // console.log('HERE');
    _.assignIn(this.current, _.cloneDeep(DrugScheme));
    // console.log(this.current);
  };

  getCurrent = () => {
    return _.cloneDeep(this.current);
  };

  getClone = async (key) => {
    let drug = await this.drug.get(key);
    return _.cloneDeep(drug);
  };

  getNew = () => {
    return _.cloneDeep(DrugScheme);
  };

  @action
  setBaseDosages = async (key) => {
    let drug = await this.drug.get(key);
    // console.log({ key, drug });

    // console.log('get dosage 1');

    if (!drug || !drug.calc || !drug.calc.dosageUnit) return;
    let { units } = this.stores.tools;
    let count = (drug.helpers.pack && units[drug.helpers.pack.id]) || units[248];

    // console.log('get dosage 2');
    // console.log({ count });
    let dosageBaseUnit = this.stores.tools.getBaseUnit(drug.calc.dosageUnit);

    // console.log('get dosage 3');
    let countBaseUnit = this.stores.tools.getBaseUnit(count.id);

    // console.log('get dosage 4');
    // console.log({ dosageBaseUnit, countBaseUnit });
    runInAction(() => {
      drug.calc.dosageBaseUnit = dosageBaseUnit;
      drug.calc.countBaseUnit = countBaseUnit;
    });
  };

  get drugsArr() {
    return Array.from(this.drug.values());
  }

  get renderRules() {
    let {
      stores: {
        dosages: { getFromBase },
        tools: { names, shortnames, round, UIText },
      },
      current: {
        freq,
        freq_id,
        duration,
        duration_id,
        calc,
        dosage,
        dosage: { form, method },
        helpers,
        schedule,
      },
      current: drug,
    } = this;
    helpers = helpers || {};
    let { finishAlternate } = schedule || {};

    let arr = {};

    // if (calc && calc.fullDosage && helpers.dosage && helpers.dosage.id) {
    //   let dosageValue = getFromBase(drug.calc.dosageUnit, calc.fullDosage);
    //   let dosageName =
    //     shortnames[drug.calc.dosageUnit] || names[drug.calc.dosageUnit];
    //   arr.dosage = `${_.map(dosageValue, (dos) => parseFloat(round(dos))).join(
    //     ' + ',
    //   )} ${dosageName}`;
    // }

    if (helpers.dosage) {
      arr.dosage = helpers.dosage.small || helpers.dosage.full;
    }

    // if(freq) arr.push(freq)

    // if(duration) arr.push(duration)
    // if(freq && UIText.freq[freq]) arr.push(UIText.freq[freq])
    if (method && names[method]) {
      arr.method = names[method];
    } else if (method) {
      arr.method = method;
    }
    if (form && names[form]) {
      arr.form = names[form];
    } else if (form) {
      arr.form = form;
    }
    if (freq_id && UIText.freq[freq_id]) {
      arr.freq = UIText.freq[freq_id];
    } else if (freq) {
      arr.freq = freq;
    }
    if (duration_id && UIText.duration[duration_id]) {
      arr.duration = UIText.duration[duration_id];
    } else if (duration) {
      arr.duration = duration;
    }
    if (finishAlternate && UIText.duration[finishAlternate]) arr.finish = UIText.duration[finishAlternate];
    return arr;
    // return {
    //   empty: arr.length < 1,
    //   text: arr.join(", "),
    // };
  }

  // service functions
  async clearProto() {
    await this.drug.forEach((drugObj, key) => {
      if (drugObj.proto) {
        // console.log(drugObj);
        this.unselectDrug(drugObj);
        // this.listChanged = true;
        // return true;
      }
    });
  }

  async clearList() {
    await this.drug.forEach((drugObj, key) => {
      // if (drugObj.proto) {
      // console.log(drugObj);
      this.unselectDrug(drugObj, false);
      // this.listChanged = true;
      // return true;
      // }
    });
    this.stores.actions.makeLiquids = false;
  }

  async returnList() {
    this.deletedLiquids.forEach(async (liquid, i) => {
      if (liquid.group != null) {
        await this.liquid.set(liquid.group, liquid);
      } else {
        this.deletedLiquids.push(liquid);
      }
    });

    this.deletedRows.forEach(async (drug, i) => {
      await this.selectFromSearch(drug, false, false);
    });

    await this.stores.tools.stepByStepLoading(this.stores.dosages.get, this.deletedRows);
    this.deletedRows = observable([]);
    this.deletedLiquids = observable([]);
  }

  async clearDeleted() {
    this.deletedRows = observable([]);
    this.deletedLiquids = observable([]);
  }

  async MNNfromTN(drug) {
    let { active_language } = this.stores.actions;
    let data = {
      drug,
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    let current = this.drug.get(drug.key);
    if (current.helpers.mnn) {
      current = _.assignIn(current, current.helpers.drugCache);
      current.helpers.mnn = false;
      current.recipenameid = null;
      current.helpers.drugCache = null;
    } else {
      return POST({
        path: `drugs/MNNfromTN`,
        data,
        success: async (data) => {
          current = _.assignIn(current, data.mnn);
          current.helpers.mnn = true;
          current.recipenameid = data.mnn.id;
          current.helpers.drugCache = _.cloneDeep(drug);
          this.stores.drugs.drug.set(drug.key, current);
          // console.log('DATA', data);
        },
        fail: (alerts) => {},
        always: (data) => {},
      });
    }
  }

  setFP = async (drugKey, fpid) => {
    let currentDrug = (await this.drug.get(drugKey)) || {};
    currentDrug = await _.assignIn(currentDrug, { fpid });
    await this.drug.set(drugKey, currentDrug);
    this.stores.dosages.get(currentDrug, true);
  };

  setDosageParams = async () => {
    let drugData = this.current;
    let calcData = this.current.calc;
    let scheduleData = this.current.schedule;
    // let {
    //   router: {values},
    // } = this.stores;

    let drug = this.getCurrent();
    let currentDrug = this.drug.get(drug.key) || {};
    let currentDosages = this.stores.dosages.dosage.get(drug.id) || {};

    let { calcValues, getFromBase } = this.stores.dosages;
    let def =
      (calcValues.dosage.firstUnit && calcValues.dosage.firstUnit.id) ||
      (calcValues.dosage.unit && calcValues.dosage.unit.id);

    let { freq, freq_id, duration, duration_id } = drug;

    currentDrug.edit = true;
    // console.log({ freq, duration });
    currentDrug.freq = freq || null;
    currentDrug.freq_id = freq_id || null;
    currentDrug.duration = duration || null;
    currentDrug.duration_id = duration_id || null;
    currentDrug.specials = ""; //this.stores.drugs.current.specials;

    let {
      key,
      form,
      method,
      pack,
      dosage,
      value,
      helpers: { dosage: hdosage, pack: hpack },
    } = drugData;

    let { way, step } = {};

    let {
      dateStart,
      dateFinish,
      finishAlternate,
      clarifications, //уточнения
      interval,
      once,
      week,
      calendar,
    } = scheduleData;

    let { dosage: dos, count, dayCount, dosageUnit, fullDosage, weightDosage, dayDosage, dayWeightDosage } = calcData;

    currentDrug.solute =
      currentDosages.form && currentDosages.form[form] ? currentDosages.form[form].solute : currentDrug.solute;
    // console.log({dosageUnit, fullDosage})
    // console.log({currentDrug})
    currentDrug.dosage = {
      form,
      method,
      pack,
      dosage,
      value,
    };
    currentDrug.helpers = {
      key,
      way,
      step,
      dosage: hdosage,
      pack: hpack,
    };
    currentDrug.schedule = {
      dateStart: parseInt(dateStart),
      dateFinish: parseInt(dateFinish),
      finishAlternate,
      clarifications, //уточнения
      interval,
      once,
      week,
      calendar,
    };

    currentDrug.calc = {
      dosage: dos,
      count,
      dosageUnit,
      dayCount,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage,
    };
    // await this.drug.set(drug.key, currentDrug);

    this.listChanged = true;
    await this.stores.dosages.dosage.set(drug.key, currentDosages);
    this.setBaseDosages(drug.key);
    this.stores.db.clearData();
  };

  getDosageParams = async () => {
    let drugData = this.stores.actions.stepsData;

    let drug = this.current;
    let currentDrug = (await this.drug.get(drug.key)) || {};
    let currentDosages = (await this.stores.dosages.dosage.get(drug.id)) || {};

    if (currentDosages.form) {
      await _.forEach(currentDosages.form, (item) => {
        if (item.solute) {
          currentDosages.solute = true;
          currentDrug.solute = true;
        }
      });
    }

    let { freq, freq_id, duration, duration_id } = drug;

    let { specials } = currentDrug;
    // console.log({currentDrug});
    let { form, method, pack, dosage, value } = currentDrug.dosage;
    let { key, way, step, dosage: hdosage, pack: hpack } = currentDrug.helpers;
    let {
      dateStart,
      dateFinish,
      finishAlternate,
      clarifications, //уточнения
      interval,
      once,
      week,
      calendar,
    } = currentDrug.schedule;
    let {
      dosage: dos,
      count,
      dosageUnit,
      dayCount,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage,
    } = currentDrug.calc;

    this.stores.actions.stepsData = {
      key,
      way,
      step,
      form,
      method,
      pack,
      dosage,
      value,
      helpers: {
        dosage: hdosage,
        pack: hpack,
      },
    };
    // console.log({dosageUnit});
    this.stores.actions.calculatorForm = {
      dosage: dos,
      count,
      dosageUnit,
      dayCount,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage,
    };
    this.stores.actions.scheduleForm = {
      dateStart: dateStart || moment(moment().format("DD.MM.YYYY"), "DD.MM.YYYY").format("x"),
      dateFinish,
      finishAlternate,
      clarifications, //уточнения
      interval,
      once,
      week,
      calendar,
    };
    // this.stores.actions.drugStructure.specials = specials;
    this.listChanged = true;
  };

  // liquids and groups
  getNewLiquid = () => {
    return _.cloneDeep(LiquidScheme);
  };

  setCurrentLiquid = async ({ liquid, key }) => {
    await _.assignIn(this.currLiquid, LiquidScheme);
    if (!liquid && !!key) liquid = await this.liquid.get(key);
    _.assignIn(this.currLiquid, liquid);
  };

  getCurrentLiquid = () => {
    return _.cloneDeep(this.currLiquid);
  };

  getCloneLiquid = async (key) => {
    let liquid = await this.liquid.get(key);
    return _.cloneDeep(liquid);
  };

  unsetCurrentLiquid = () => {
    _.assignIn(this.currLiquid, LiquidScheme);
  };

  async setGroup(keys, group) {
    if (!_.isArray(keys)) {
      keys = [keys];
    }

    let currGroup = null;
    await keys.forEach(async (key, i) => {
      let drug = await this.drug.get(key);
      currGroup = drug.group;

      drug.group = group;
      drug.edit = true;

      this.drug.set(key, drug);
    });

    await this.drug.forEach(async (drug, key) => {
      if (drug.group == group && group !== 0) {
        drug.edit = true;
      }
      if (drug.group == currGroup && group == 0) {
        drug.edit = true;
      }
    });

    let currLiquid = (await this.liquid.get(currGroup)) || {};

    if (currLiquid.key) {
      currLiquid.edit = true;
      // await this.liquid.set( currGroup, currLiquid )
    }

    if (group == 0) {
      if (currLiquid.proto) {
        this.deletedLiquids.push(currLiquid);
      }
      this.liquid.delete(currGroup);
    }

    this.stores.actions.makeLiquids = true;
    setTimeout(() => {
      this.checkLiquidsOk();
    }, 300);
  }

  async resetGroups() {
    this.drug.forEach((item, i) => {
      if (item.group !== 0) {
        item.group = 0;
        this.drug.set(item.key, item);
      }
    });
  }

  get checkLiquids() {
    let isOk = true;
    let obj = {};
    this.drug.forEach((item, i) => {
      if (item.group !== 0) {
        obj[item.group] = !!obj[item.group] ? obj[item.group] + 1 : 1;
      }
    });
    _.forEach(obj, (counter) => {
      if (counter < 2 && counter !== 0) {
        isOk = false;
      }
    });
    return isOk;
  }

  async checkLiquidsOk() {
    let isOk = true;
    let obj = {};
    this.drug.forEach((item, i) => {
      if (item.group !== 0) {
        obj[item.group] = !!obj[item.group] ? obj[item.group] + 1 : 1;
      }
    });
    _.forEach(obj, (counter) => {
      if (counter < 2 && counter !== 0) {
        isOk = false;
      }
    });
    // console.log(obj)
    this.stores.actions.isLiquidsOk = isOk;
  }

  get calcLiquid() {
    let {
      drug: drugs,
      stores: {
        tools: { unitarrs },
        // router: {values: route},
      },
    } = this;

    //hardcode!!!
    let liquidUnits = unitarrs[112];
    let dryUnits = unitarrs[42];

    let counts = {};
    let weights = {};
    let weight = []; // list of weights
    let count = 0; //full value of liquid
    let unit = null; //dosage unit
    let liqUnit = null; //liquid unit
    let id = (route && route.liquid) || null;
    let ready = true;

    drugs.forEach((drugObj, key) => {
      let drug = { ...drugObj };

      if (drug.group == id) {
        if (drug.calc.dosage && drug.calc.dosage[0] > 0) {
          if (dryUnits.includes(drug.calc.dosageUnit)) {
            weights[drug.key] = {
              count: drug.calc.fullDosage,
              unit: drug.calc.dosageUnit,
            };
            if (!drug.calc.fullDosage) {
              drug.calc.fullDosage = [];
            } else if (!Array.isArray(drug.calc.fullDosage)) {
              drug.calc.fullDosage = [drug.calc.fullDosage];
            }
            weight = [...weight, ...drug.calc.fullDosage];
            unit = unit || drug.calc.dosageUnit;
          } else if (liquidUnits.includes(drug.calc.dosageUnit)) {
          }
          if (drug.dosage && drug.dosage.pack && drug.dosage.pack.dosage) {
            if (dryUnits.includes(drug.dosage.pack.dosage.id_1)) {
            } else if (liquidUnits.includes(drug.dosage.pack.dosage.id_1)) {
              counts[drug.key] = {
                count: drug.calc.count,
                unit: drug.dosage.pack.dosage.id_1,
              };
              count += drug.calc.count;
              liqUnit = liqUnit || drug.dosage.pack.dosage.id_1;
            }
          }
        } else {
          ready = false;
        }
      }
    });
    // console.log({
    //   weight, count, weights, counts, ready, unit, liqUnit, liquidUnits, dryUnits, id
    // });
    // this.listChanged = true
    return {
      weight,
      count,
      weights,
      counts,
      ready,
      unit,
      liqUnit,
      liquidUnits,
      dryUnits,
      id,
    };
  }

  removeLiquids = async (arr) => {
    if (!arr) return;
    if (!Array.isArray(arr)) arr = [arr];
    arr.forEach((item, i) => {
      let currLiquid = this.liquid.get(item) || {};
      if (currLiquid.proto) {
        this.deletedLiquids.push(currLiquid);
      }
      this.liquid.delete(item);
    });
    this.listChanged = true;
  };

  makeLiquids = async () => {
    let obj = {};
    this.drug.forEach((item, i) => {
      if (item.group !== 0) {
        obj[item.group] = !!obj[item.group] ? obj[item.group] + 1 : 1;
      }
    });

    _.forEach(obj, async (counter, key) => {
      if (counter > 1 && counter != 0 && key != 0) {
        if (!this.liquid.get(key)) {
          await this.makeLiquid(key);
        }
      } else {
        let maybeLiquid = this.liquid.get(key);
        if (maybeLiquid) {
          this.deletedLiquids.push(maybeLiquid);
          this.liquid.delete(key);
        }
      }
    });

    this.listChanged = true;
  };

  makeLiquid = async (key) => {
    key = parseInt(key);
    let current = this.liquid.get(key) || {};

    current.edit = true;
    if (current.group && current.group !== 0) return;
    current.group = key;

    let liquid = this.getNewLiquid();
    current = _.assignIn(liquid, current);

    await this.liquid.set(key, current);

    await this.getLiquidParams(key);
    return true;
  };

  setLiquidParams = async (id = null) => {
    // let {
    //   stores: {
    //     router: {values: route},
    //   },
    // } = this;
    id = id || (route && route.liquid) || null;
    if (!id) return;
    id = parseInt(id);
    this.drug.forEach((drug, i) => {
      if (drug.group == id) drug.edit = true;
    });

    let current = (await this.liquid.get(id)) || {};
    let {
      name, // Название ДВ или ТН
      group, // группа раствора (0 - нет раствора, больше 0 - раствор)
      specials,
      freq,
      edit,
      freq_id,
      duration,
      duration_id,
      calc: {
        dosageBaseUnit,
        dosage,
        count,
        dosageUnit,
        dayCount,
        fullDosage,
        weightDosage,
        dayDosage,
        dayWeightDosage,
        durationCount,
        durationUnit,
        fullSpeed,
        weightSpeed,
        tintSpeed,
        liquidSpeed,
      },
      schedule: {
        dateStart,
        dateFinish,
        finishAlternate,
        clarifications, //уточнения
        interval,
        once,
        week,
        calendar,
      },
    } = this.stores.actions.liquidForm;

    edit = true;
    current.edit = true;

    this.liquid.set(
      id,
      _.assignIn(current, {
        name,
        group,
        specials,
        freq,
        edit,
        freq_id,
        duration,
        duration_id,
        calc: {
          dosageBaseUnit,
          dosage,
          count,
          dosageUnit,
          dayCount,
          fullDosage,
          weightDosage,
          dayDosage,
          dayWeightDosage,
          durationCount,
          durationUnit,
          fullSpeed,
          weightSpeed,
          tintSpeed,
          liquidSpeed,
        },
        schedule: {
          dateStart,
          dateFinish,
          finishAlternate,
          clarifications, //уточнения
          interval,
          once,
          week,
          calendar,
        },
      })
    );
    this.listChanged = true;
    // console.log(this.liquid.get(id));
  };

  recalcLiquidParams = (id = null) => {
    let {
      stores: {
        // router: {values: route},
        dosages: { getToBase, getFromBase },
      },
    } = this;
    id = id || (route && route.liquid) || null;
    if (!id) return;
    id = parseInt(id);

    let patientWeight = this.stores.patients.current.weight;
    let { dosage, count, dosageUnit, dayCount, durationCount, durationUnit } = this.stores.actions.liquidForm.calc;
    //.reduce((a, b) => a + b)
    let fullDosage = _.map(dosage, (dos) => {
      return dos * count;
    });
    let weightDosage = _.map(fullDosage, (dos) => {
      return patientWeight ? dos / patientWeight : 0;
    });
    let dayDosage = _.map(fullDosage, (dos) => {
      return dos * dayCount;
    });
    let dayWeightDosage = _.map(weightDosage, (dos) => {
      return patientWeight ? dos * dayCount : 0;
    });
    let fullSpeed = _.map(fullDosage, (dos) => {
      return dos / durationCount;
    });
    let weightSpeed = _.map(fullSpeed, (dos) => {
      return patientWeight ? dos / patientWeight : 0;
    });
    let tintSpeed = getToBase(168, getFromBase(799, count)) / durationCount;
    let liquidSpeed = count / durationCount;

    this.stores.actions.liquidForm.calc = {
      dosage,
      count,
      dosageUnit,
      dayCount,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage,
      durationCount,
      durationUnit,
      fullSpeed,
      weightSpeed,
      tintSpeed,
      liquidSpeed,
    };
    this.listChanged = true;
  };

  getLiquidParams = async (id = null) => {
    let {
      stores: {
        // router: {values: route},
        dosages: { getToBase, getFromBase },
      },
    } = this;
    id = id || (route && route.liquid) || null;
    if (!id) return;
    id = parseInt(id);

    let current = await this.liquid.get(id);

    if (!current) return;

    let flag = false; //if dosages changed set true

    let { ready, weights, counts, weight, count: calcCount, unit } = this.calcLiquid;

    let arr = [];
    this.drug.forEach((drug, key) => {
      if (drug.group === id) {
        arr.push(drug.key);
      }
    });

    if (current.calc.dosage && current.calc.dosage[0] === 0) flag = true;
    if (weight.length != current.calc.dosage.length || calcCount != current.calc.count) flag = true;
    if (!_.isEqual(_.keys(weights), arr)) flag = true;
    if (!_.isEqual(weight, current.calc.dosage)) flag = true;
    if (!ready) return;

    // console.log('HEREs');

    //
    let { name, group, specials, freq, edit, freq_id, duration, duration_id } = current;
    // console.log('HERE 1');
    if (flag) {
      let patientWeight = this.stores.patients.current.weight;
      let dosage = _.map(weight, (dos) => {
        return dos / calcCount;
      });
      // let fullDosage = weight
      //console.log({fullDosage});
      this.stores.actions.liquidForm = {
        name, // Название ДВ или ТН
        group, // группа раствора (0 - нет раствора, больше 0 - раствор)
        specials,
        freq,
        freq_id,
        duration,
        duration_id,
        calc: {
          dosageBaseUnit: "248",
          dosage: dosage,
          count: calcCount,
          dosageUnit: unit,
          dayCount: 1,
          fullDosage: weight,
          weightDosage: [0], //_.map( fullDosage, (dos) => { return patientWeight ? getToBase((unit || 248), dos)/patientWeight : 0 } ),
          dayDosage: [0], // fullDosage,
          dayWeightDosage: [0], // _.map( fullDosage, (dos) => { return patientWeight ? getToBase((unit || 248), dos)/patientWeight : 0 } ),
          durationCount: 1,
          durationUnit: "75",
          fullSpeed: [0], // fullDosage,
          weightSpeed: [0], // _.map( fullDosage, (dos) => { return patientWeight ? getToBase((unit || 248), dos)/patientWeight : 0 } ),
          tintSpeed: 0, // getFromBase( 799, fullDosage ),
          liquidSpeed: 0, //calcCount
        },
        schedule: {
          dateStart: null,
          dateFinish: null,
          finishAlternate: null,
          clarifications: null, //уточнения
          interval: null,
          once: null,
          week: null,
          calendar: null,
        },
      };
      setTimeout(this.recalcLiquidParams, 200);
      // console.log({
      //   dosage: weight,
      //   count: calcCount,
      //   dosageUnit: unit,
      //   dayCount: 1,
      //   fullDosage: fullDosage,
      //   weightDosage: _.map( fullDosage, (dos) => { return getToBase((unit || 248), dos)/patientWeight } ),
      //   dayDosage: fullDosage,
      //   dayWeightDosage: _.map( fullDosage, (dos) => { return getToBase((unit || 248), dos)/patientWeight } ),
      //   durationCount: 1,
      //   durationUnit: 75,
      //   fullSpeed: fullDosage,
      //   weightSpeed: _.map( fullDosage, (dos) => { return getToBase((unit || 248), dos)/patientWeight } ),
      //   tintSpeed: getFromBase( 799, fullDosage ),
      //   liquidSpeed: calcCount
      // });
    } else {
      // console.log('HERE 3');
      let {
        calc: {
          dosageBaseUnit,
          dosage,
          count,
          dosageUnit,
          dayCount,
          fullDosage,
          weightDosage,
          dayDosage,
          dayWeightDosage,
          durationCount,
          durationUnit,
          fullSpeed,
          weightSpeed,
          tintSpeed,
          liquidSpeed,
        },
        schedule: {
          dateStart,
          dateFinish,
          finishAlternate,
          clarifications, //уточнения
          interval,
          once,
          week,
          calendar,
        },
      } = current;
      this.stores.actions.liquidForm = {
        name, // Название ДВ или ТН
        group, // группа раствора (0 - нет раствора, больше 0 - раствор)
        specials,
        freq,
        freq_id,
        duration,
        duration_id,
        calc: {
          dosageBaseUnit,
          dosage,
          count,
          dosageUnit,
          dayCount,
          fullDosage,
          weightDosage,
          dayDosage,
          dayWeightDosage,
          durationCount,
          durationUnit,
          fullSpeed,
          weightSpeed,
          tintSpeed,
          liquidSpeed,
        },
        schedule: {
          dateStart,
          dateFinish,
          finishAlternate,
          clarifications, //уточнения
          interval,
          once,
          week,
          calendar,
        },
      };
      if (this.stores.patients.current.weight && parseFloat(this.stores.patients.current.weight) > 0)
        this.recalcLiquidParams();
    }
    // this.liquid.set( group, _.assignIn(current, liquid) );
    this.listChanged = true;
    return true;
  };

  checkMusthave = async ({ fp_id, tn_id, dv_id }, key) => {
    const { meteorAsyncCall } = this.stores.tools;
    if (!fp_id) fp_id = null;
    if (!tn_id) tn_id = null;
    if (!dv_id) dv_id = null;
    let { res, err } = await meteorAsyncCall("checkMusthave", {
      fp_id,
      tn_id,
      dv_id,
    });
    // console.log({res, err});
    if (!err && key && res && res.must_have) {
      this.musthaveList[key] = { key, ...res };
    }
  };

  removeMusthave = (key) => {
    delete this.musthaveList[key];
  };

  getConcepts = async () => {
    const { meteorAsyncCall } = this.stores.tools;
    runInAction(() => {
      this.stores.pharms.loading = true;
    });
    let local_hash = await this.stores.local.getString("concepts_hash");

    let remote_hash = await meteorAsyncCall("getHash", "concepts_cache");

    let letters = [];
    // console.log({remote_hash, local_hash});
    if (remote_hash && remote_hash.res && remote_hash.res == local_hash) {
      console.log("case 1");
      letters = await this.stores.local.getOne("letters");
    } else if (!remote_hash || remote_hash.err) {
      console.log("case 2");
      letters = await this.stores.local.getOne("letters");
    } else {
      console.log("case 3");
      await this.stores.local.setString("concepts_hash", remote_hash.res);
      let { res, err } = await meteorAsyncCall("getConcepts");
      if (!err && res) {
        // console.log(res);
        letters = _.keys(res);
        // console.log({letters});
        await this.stores.local.setOne("letters", letters);
        // await this.stores.local.setOne('concepts', res);
        letters.forEach(async (letter, i) => {
          let saved = await this.stores.local.setOne("concepts_" + letter, res[letter]);
          // console.log({saved, name: 'concepts_' + letter});
        });
      }
    }
    runInAction(() => {
      this.letters = letters;
      // this.stores.pharms.loading = false;
    });
  };

  @action
  async searchNew(text, saveTo = "search") {
    this.searchReady = false;
    if (text.length < 2) {
      runInAction(() => {
        this[`${saveTo}Rows`] = [];
        this.searchReady = true;
      });
      return;
    }
    let letter = text.substring(0, 1).toLowerCase();
    // console.log({text});
    if (!this.concepts[letter]) {
      this.concepts[letter] = await this.stores.local.getOne("concepts_" + letter);
      // console.log({
      //   letter: 'concepts_' + letter,
      //   'this.concepts': this.concepts[letter],
      // });
    }
    let results = [];
    let searchArr = text.split("");
    let len = searchArr.length;
    if (!this.concepts[letter]) return;
    this.concepts[letter].forEach((concept, n) => {
      let score = 100;
      let match = 0;
      let currArr = concept.name.split("");

      searchArr.forEach((symbol, i) => {
        // if (concept.name == 'Омез') {
        //   console.log(
        //     'omez 0',
        //     symbol.toLowerCase(),
        //     currArr[i].toLowerCase(),
        //     symbol.toLowerCase() == currArr[i].toLowerCase(),
        //   );
        // }
        if (currArr[i] && symbol.toLowerCase() == currArr[i].toLowerCase()) {
          // if (concept.name == 'Омез') {
          //   console.log('omez 1');
          // }
          score += 3;
          match++;
        } else if (currArr[i + 1] && symbol.toLowerCase() == currArr[i + 1].toLowerCase()) {
          // if (concept.name == 'Омез') {
          //   console.log('omez 2');
          // }
          score++;
          match++;
        } else {
          // if (concept.name == 'Омез') {
          //   console.log('omez 3');
          // }
          score--;
        }
      });
      if (len == currArr.length && match == len) score += 100;
      // if (concept.name.toLowerCase() == text.toLowerCase()) score += 200;
      if (match > 0) {
        concept.name = concept.name
          .split(" ")
          .map((word) => {
            return word
              .split("-")
              .map((word2) => {
                return word2.ucfirst();
              })
              .join("-");
          })
          .join(" ")
          .replace(/<[^>]*>/gi, "");
        results.push({
          ...concept,
          title: concept.name,
          score,
          key: "concept" + n,
        });
      }

      // if (concept.name == 'Омез') {
      //   console.log('omez', score);
      // }
    });

    results = await _.orderBy(results, ["score"], ["desc"]);

    let found = results.slice(0, 30);

    if (found && found.length > 0) {
      runInAction(() => {
        this[`${saveTo}Rows`] = found;
        this.searchReady = true;
      });
    } else {
      runInAction(() => {
        this[`${saveTo}Rows`] = [];
        this.searchReady = true;
      });
    }
  }

  // search, creae and remove drugs
  @action
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
    data.authkey = this.stores.user.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `search/Drugs`,
      data,
      success: async (data) => {
        // console.log(data);
        if (data.concepts && data.concepts.length > 0 && _.isArray(data.concepts)) {
          await data.concepts.forEach((concept, i) => {
            data.concepts[i].key = "concept" + i;
            data.concepts[i].title = data.concepts[i].name;
          });
          runInAction(() => {
            this[`${saveTo}Rows`] = data.concepts;
            this.searchReady = true;
          });

          // this[`${saveTo}Rows`] = await _.unionWith(
          //   data.concepts,
          //   this[`${saveTo}Rows`],
          //   (a, b) => a.id === b.id,
          // );
        } else if (data.concepts && data.concepts.length == 0 && _.isArray(data.concepts)) {
          runInAction(() => {
            this[`${saveTo}Rows`] = [];
            this.searchReady = true;
          });
        }
      },
      fail: (alerts) => {
        this.searchReady = true;
        // console.log('fail 1', alerts);
      },
      always: (data) => {
        // this.stores.actions.makeAlerts(data)
      },
    });
  }

  // concept from search, flag - if true, do not clear data
  @action
  selectFromSearch = async (concept, flag = false, getDosages = true, searchAvailable = false, setCurrent = true) => {
    let drug = this.getNew();
    if (!concept.calc) concept.calc = drug.calc;
    if (!concept.dosage) concept.dosage = drug.dosage;
    if (!concept.schedule) concept.schedule = drug.schedule;
    drug = Object.assign(drug, concept);

    drug.key = concept.key && concept.key.substring(0, 7) !== "concept" ? concept.key : moment().format("x").toString();

    await this.drug.set(drug.key, drug);
    // console.log({drug});
    // _.assignIn(this.current, drug);
    if (setCurrent) {
      this.setCurrent({ drug });
    }

    let checkParams = {
      fp_id: null,
      tn_id: null,
      dv_id: null,
    };
    if (concept.type == "TN") checkParams.tn_id = concept.id;
    if (concept.type == "DV") checkParams.dv_id = concept.id;
    if (concept.fpid) checkParams.fp_id = concept.fpid;
    // console.log({checkParams});
    let mustHave = await this.checkMusthave(checkParams, drug.key);

    if (getDosages) {
      await this.stores.dosages.get(drug);
    }
    if (searchAvailable) {
      this.stores.pharms.getAvailable(drug);
    }
    // console.log('here 11');
    if (!flag) {
      // console.log('here 13');
      await this.stores.db.clearData(false, true);
      // console.log('here 14');
    }
    runInAction(() => {
      this.listChanged = true;
    });
    return true;
  };

  async unselectDrug(drug, onlyProto = true) {
    this.removeMusthave(drug.key);

    if (drug.proto || !onlyProto) {
      this.deletedRows.push(drug);
    }
    if (drug.group != 0) {
      this.stores.actions.makeLiquids = true;
      this.removeLiquids([drug.group]);
    }
    await this.drug.delete(drug.key);
    // await this.stores.dosages.dosage.delete(drug.key)
    this.selectedRows = await _.xorWith(this.selectedRows, [drug], (a, b) => a.id === b.id);
    this.stores.db.clearData(false, true);
    this.checkLiquidsOk();
    this.listChanged = true;

    this.stores.pharms.ungetAvailable(drug);

    return true;
  }
}
export default Drugs;
