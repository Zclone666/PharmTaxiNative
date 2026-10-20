import { observable, action, autorun, computed } from "mobx";
import { GET, POST, PUT } from "../lib/connect";
import moment from "moment";

import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
// import { Accounts } from "meteor/accounts-base";

import { assortiment, MedChest, orders, AvailableDrug } from "/both/collections";

var subs = new SubsManager({
  cacheLimit: 1000,
  expireIn: 24 * 60,
});
Meteor.subs = subs;
subs.subscribe("myFullUser");
// subs.subscribe("assortiment");
// subs.subscribe("ordersWithPharms");
// subs.subscribe("orders"); //{"drug": {"tn_id": "kD1AcC5OV7kYWbNtRtcQnw=="}, "ready": false, "subs": {"subscriptionId": "siwrwLzs6FN4XFizs"}}
// subs.subscribe("availableInAll", [{ tn_id: "fTywoIw0ML8PEWnr9PCl2A==" }, { tn_id: "kD1AcC5OV7kYWbNtRtcQnw==" }]);
// subs.subscribe("pharmsInRadius", 37.135228491574526, 37.349962536245584, 55.19118345307618, 55.47477092365834);
// subs.subscribe("availableDrug", { tn_id: "kD1AcC5OV7kYWbNtRtcQnw==" });
// Meteor.call(
//   "login",
//   {
//     authType: "app",
//     auth: {
//       email: "25st_man@yopmail.com",
//       password: "100500",
//     },
//   },
//   (err, res) => {
//     console.log({ err, res });
//     if (res) {
//       console.log({ res });
//       // Meteor._handleLoginCallback(err, res);
//       // console.log({user: Meteor.user()});
//       // let resDef = {
//       //   id: '9eyQc7fivGnEoEimT',
//       //   token: 'ECoEWN6BkRLR7PZtfq3yrqnW_iASoYOvtOK3L6O7OEm',
//       //   tokenExpires: '2021-07-26T17:50:07.145Z',
//       //   type: 'AppGuestAuth',
//       // };
//     }
//   }
// );
// Meteor.call(
//   "fromGuest",
//   {
//     phone: "123456789",
//     email: "29st_man@yopmail.com",
//     password: "100500",
//   },
//   (err, res) => {
//     console.log({ err, res });
//     if (res) {
//       console.log({ res });
//       // Meteor._handleLoginCallback(err, res);
//       // console.log({user: Meteor.user()});
//       // let resDef = {
//       //   id: '9eyQc7fivGnEoEimT',
//       //   token: 'ECoEWN6BkRLR7PZtfq3yrqnW_iASoYOvtOK3L6O7OEm',
//       //   tokenExpires: '2021-07-26T17:50:07.145Z',
//       //   type: 'AppGuestAuth',
//       // };
//     }
//   }
// );
// let realUser = await meteorAsyncCall('fromGuest', {
//   email,
//   password,
//   phone,
// });
// console.log(Accounts);
// Tracker.autorun(() => {
//   if (Meteor.user()) {
//     console.log("AUTOLOGIN");
//     // _.assignIn(this.me, Meteor.user());
//   }
// });
// function myfunc() {
//   console.log("IM HERE");
// }
// Accounts._onLoginHook.register(myfunc);
// Accounts._onLoginFailureHook.register(myfunc);
Accounts.onLogin(async () => {
  console.log("HERE");

  // POST({
  //   path: `https://service.socmedica.dev:9025/SaveOrder`,
  //   data: {
  //     authkey: "_idinahui",
  //     order: {
  //       // Delivery: null,
  //       // DeliveryAddress: null,
  //       drugs: [
  //         { id: "+zdW4t3WAponqCBOEKnjGw==", packs: 1, price: 168 },
  //         { id: "hTMl1CrUs08vXRO3GKnW8A==", packs: 2, price: 85 },
  //         { id: "E/7zVmfKyjrf5iKnsjwt5g==", packs: 5, price: 67.19999694824219 },
  //         { id: "IwqTLVAKKfzQ4efFabgBVQ==", packs: 1, price: 273 },
  //       ],
  //       pharm_id: 1291,
  //     },
  //   },
  //   success: async (data) => {
  //     console.log(data);
  //   },
  //   fail: (alerts) => {
  //     console.log({ alerts });
  //   },
  //   always: (data) => {
  //     console.log({ data });
  //   },
  // });
  // Meteor.call(
  //   "ReadBarcode",
  //   {
  //     data: "4607100621577",
  //     type: "EAN_13",
  //     accuracy: 1,
  //     coords: [37, 55],
  //   },
  //   (err, res) => {
  //     console.log({ err, res });
  //     // if (err) {
  //     //   alert(err);
  //     // } else {
  //     //   console.log("barcode data: ", res);
  //     // }
  //   }
  // );
  // Meteor.call("getDrugAvailable", { tn_id: "kD1AcC5OV7kYWbNtRtcQnw==" }, (err, res) => {
  //   console.log({ err, res });
  // });
  // Meteor.call(
  //   "getPharmWithAssortiment",
  //   1089,
  //   [
  //     { key: "1623242509564", tn_id: "fTywoIw0ML8PEWnr9PCl2A==" },
  //     { key: "1623242527161", tn_id: "9DIZ2vV0tN1r0lkgLq9F+A==" },
  //   ],
  //   (err, res) => {
  //     console.log({ err, res });
  //   }
  // );
  // // Meteor.call(
  // //   "saveOrder",
  //   {
  //     Delivery: null,
  //     DeliveryAddress: null,
  //     drugs: [
  //       { id: "+zdW4t3WAponqCBOEKnjGw==", packs: 1, price: 168 },
  //       { id: "hTMl1CrUs08vXRO3GKnW8A==", packs: 2, price: 85 },
  //       { id: "E/7zVmfKyjrf5iKnsjwt5g==", packs: 5, price: 67.19999694824219 },
  //       { id: "IwqTLVAKKfzQ4efFabgBVQ==", packs: 1, price: 273 },
  //     ],
  //     pharm_id: 1291,
  //   },
  //   (err, res) => {
  //     console.log({ err, res });
  //   }
  // );
  // key: "1",
  // id: "kD1AcC5OV7kYWbNtRtcQnw==",
  // fpid: null,
  // type: "TN",
  // level: 240,
  // name: "Нурофен",
  // namesearch: "string",
  // group: 0,
  // main: true,
  // Meteor.call("login", { authType: "app_guest" }, (err, res) => {
  //   // console.log({err, res});
  //   if (res) {
  //     console.log({ res });
  //     // Meteor._handleLoginCallback(err, res);
  //     // console.log({user: Meteor.user()});
  //     // let resDef = {
  //     //   id: '9eyQc7fivGnEoEimT',
  //     //   token: 'ECoEWN6BkRLR7PZtfq3yrqnW_iASoYOvtOK3L6O7OEm',
  //     //   tokenExpires: '2021-07-26T17:50:07.145Z',
  //     //   type: 'AppGuestAuth',
  //     // };
  //   }
  // });
  // Meteor.call(
  //   "getDrugInfo",
  //   {
  //     fpid: null,
  //     group: 0,
  //     id: "EmebBviJ9SkZrDjJGWWREw==",
  //     key: "1619566964873",
  //     level: 241,
  //     main: false,
  //     name: "Парацетамол",
  //     namesearch: null,
  //     type: "DV",
  //   },
  //   (err, res) => {
  //     console.log({ err, res });
  //   }
  // );

  // Meteor.call(
  //   "fromGuest",
  //   {
  //     email: "1st_MAN@mail.ru",
  //     password: "100500",
  //     firstname: "Даниил",
  //     lastname: "Александров",
  //     patronymic: "Сергеевич",
  //   },
  //   (err, res) => {
  //     console.log({ err, res });
  //   }
  // );

  // Meteor.call("getAllPharms", 0, 100000, (err, res) => {
  //   console.log({ err, res });
  //   res.forEach((item, i) => {
  //     if (item._id == 395661) console.log(item);
  //   });
  // });
  //
  // Meteor.call(
  //   "getDosage",
  //   {
  //     fpid: null,
  //     group: 0,
  //     id: "zcPsJo+obg1SHuNjAQCJ2A==",
  //     key: "1621820670965",
  //     level: 240,
  //     main: false,
  //     name: "Парацетамол",
  //     namesearch: null,
  //     type: "TN",
  //   },
  //   (err, res) => {
  //     console.log({ err, res });
  //   }
  // );

  // Meteor.call(
  //   "checkEmail",
  //   "1st_man@mail.ru",
  //
  //   (err, res) => {
  //     console.log({ err, res });
  //   }
  // );

  // Meteor.call(
  //   "getConcepts",
  //
  //   (err, res) => {
  //     console.log({ err, res });
  //   }
  // );
  // const response = await fetch("https://roszdravnadzor.gov.ru/ajax/services/licenses", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body:
  //     "draw=4&columns%5B0%5D%5Bdata%5D=col1.label&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=col2.label&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=col3.label&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=col4.label&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=false&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=col5.label&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=false&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=col6.label&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=false&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=col7.label&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=false&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=col8.label&columns%5B7%5D%5Bname%5D=&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=false&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5Bdata%5D=col9.label&columns%5B8%5D%5Bname%5D=&columns%5B8%5D%5Bsearchable%5D=true&columns%5B8%5D%5Borderable%5D=false&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B9%5D%5Bdata%5D=col10.label&columns%5B9%5D%5Bname%5D=&columns%5B9%5D%5Bsearchable%5D=true&columns%5B9%5D%5Borderable%5D=false&columns%5B9%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B9%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B10%5D%5Bdata%5D=col11.label&columns%5B10%5D%5Bname%5D=&columns%5B10%5D%5Bsearchable%5D=true&columns%5B10%5D%5Borderable%5D=false&columns%5B10%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B10%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B11%5D%5Bdata%5D=col12.label&columns%5B11%5D%5Bname%5D=&columns%5B11%5D%5Bsearchable%5D=true&columns%5B11%5D%5Borderable%5D=false&columns%5B11%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B11%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B12%5D%5Bdata%5D=col13.label&columns%5B12%5D%5Bname%5D=&columns%5B12%5D%5Bsearchable%5D=true&columns%5B12%5D%5Borderable%5D=false&columns%5B12%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B12%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B13%5D%5Bdata%5D=col14.label&columns%5B13%5D%5Bname%5D=&columns%5B13%5D%5Bsearchable%5D=true&columns%5B13%5D%5Borderable%5D=false&columns%5B13%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B13%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B14%5D%5Bdata%5D=col15.label&columns%5B14%5D%5Bname%5D=&columns%5B14%5D%5Bsearchable%5D=true&columns%5B14%5D%5Borderable%5D=false&columns%5B14%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B14%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B15%5D%5Bdata%5D=col16.label&columns%5B15%5D%5Bname%5D=&columns%5B15%5D%5Bsearchable%5D=true&columns%5B15%5D%5Borderable%5D=false&columns%5B15%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B15%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B16%5D%5Bdata%5D=col17.label&columns%5B16%5D%5Bname%5D=&columns%5B16%5D%5Bsearchable%5D=true&columns%5B16%5D%5Borderable%5D=false&columns%5B16%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B16%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B17%5D%5Bdata%5D=col18.label&columns%5B17%5D%5Bname%5D=&columns%5B17%5D%5Bsearchable%5D=true&columns%5B17%5D%5Borderable%5D=false&columns%5B17%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B17%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B18%5D%5Bdata%5D=col19.label&columns%5B18%5D%5Bname%5D=&columns%5B18%5D%5Bsearchable%5D=true&columns%5B18%5D%5Borderable%5D=false&columns%5B18%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B18%5D%5Bsearch%5D%5Bregex%5D=false&start=0&length=25&search%5Bvalue%5D=&search%5Bregex%5D=false&prev_total=1&q_no=%D0%9B%D0%9E-77-02-011273&q_org_label=&q_org_inn=&q_org_ogrn=&dt_from=&dt_to=&q_active=0&q_type=1&q_activity=&q_region=",
  // });
  // let res = await response.json();
  // console.log({ res });
  // Meteor.call("checkLicense", "ЛО-77-02-011273", ЛО-47-02-001594 (err, res) => {
  //   console.log({ err, res });
  // });

  // Meteor.call(
  //   "saveFakeOrder",
  //   {
  //     pharm_id: 3994,
  //     items: [
  //       {
  //         qty: 1,
  //         drug: {
  //           key: "1624142844819",
  //           id: "kD1AcC5OV7kYWbNtRtcQnw==",
  //           name: "Нурофен",
  //           level: 240,
  //           fpid: null,
  //           type: "TN",
  //           edit: true,
  //           group: 0,
  //           text: null,
  //           specials: null,
  //           freq: null,
  //           freq_id: null,
  //           duration: null,
  //           duration_id: null,
  //           recipenameid: null,
  //           solute: false,
  //           dosage: {
  //             form: "+qbdqiTg3nODLu1K4yKQDQ==",
  //             method: "azk9D8yXCUT1fH5MCHl0mg==",
  //             pack: null,
  //             dosage: [{ type: "value", value_1: 200, value_2: null, id_1: "248", id_2: null, _id: null }],
  //             value: [200],
  //           },
  //           calc: {
  //             dosageBaseUnit: "248",
  //             countBaseUnit: null,
  //             dosage: [200],
  //             count: 1,
  //             dosageUnit: "248",
  //             dayCount: 1,
  //             fullDosage: [200],
  //             weightDosage: [0],
  //             dayDosage: [200],
  //             dayWeightDosage: [0],
  //           },
  //           schedule: {
  //             dateStart: null,
  //             dateFinish: null,
  //             finishAlternate: null,
  //             clarifications: null,
  //             interval: null,
  //             once: null,
  //             week: null,
  //             calendar: null,
  //           },
  //           helpers: {
  //             dosage: { small: "200 мг", full: "200 миллиграмм", id: "248" },
  //             pack: { small: "", full: "", id: "342" },
  //             type: "simple",
  //             flag: false,
  //           },
  //           namesearch: null,
  //           main: false,
  //           title: "Нурофен",
  //           price: 176.021429,
  //         },
  //       },
  //       {
  //         qty: 2,
  //         drug: {
  //           key: "1624142858651",
  //           id: "XOUVnhJ7nkqAtWomJAxlAQ==",
  //           name: "Диклофенак",
  //           level: 239,
  //           fpid: null,
  //           type: "DV",
  //           edit: true,
  //           group: 0,
  //           text: null,
  //           specials: null,
  //           freq: null,
  //           freq_id: null,
  //           duration: null,
  //           duration_id: null,
  //           recipenameid: null,
  //           solute: false,
  //           dosage: { form: "aEJd0HuLPFsMG/QDaKiwSg==", method: null, pack: {}, dosage: [], value: null },
  //           calc: {
  //             dosageBaseUnit: "248",
  //             countBaseUnit: null,
  //             dosage: [0],
  //             count: 1,
  //             dosageUnit: "248",
  //             dayCount: 1,
  //             fullDosage: [0],
  //             weightDosage: [0],
  //             dayDosage: [0],
  //             dayWeightDosage: [0],
  //           },
  //           schedule: {
  //             dateStart: null,
  //             dateFinish: null,
  //             finishAlternate: null,
  //             clarifications: null,
  //             interval: null,
  //             once: null,
  //             week: null,
  //             calendar: null,
  //           },
  //           helpers: { dosage: {}, pack: {}, url: "", key: null, way: null, step: null, mnn: false, drugCache: null },
  //           namesearch: null,
  //           main: false,
  //           title: "Диклофенак",
  //           price: 100,
  //         },
  //       },
  //     ],
  //   },
  //   (err, res) => {
  //     console.log({ err, res });
  //   }
  // );
});
import _ from "lodash";

const colorPallette = ["#007b2b", "#b0d512", "#03529b", "#fff42b", "#ffca2f", "#fc7301", "#f42a03"];

class DB {
  @observable ready = false;
  @observable searchReady = true;

  @observable searchRows = [];

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    // this.assortiment = {
    //   data: observable.map({}, "assortiment"),
    //   ready: observable.box(true),
    // };

    this.orders = {
      data: observable.map({}, "orders"),
      ready: observable.box(true),
    };

    Tracker.autorun(() => {
      if (!Meteor.subs.ready()) return;
      // this.assortiment.ready.set(false);
      console.log("Track AvailableDrug");
      AvailableDrug.find().forEach((item, key, arr) => {
        console.log(item);
        // this.updateModel("assortiment", item, key, arr);
      });
    });

    // Tracker.autorun(() => {
    //   if (!this.assortiment.ready.get() || !Meteor.subs.ready()) return;
    //   this.assortiment.ready.set(false);
    //   console.log("Track assortiment");
    //   assortiment.find().forEach((item, key, arr) => {
    //     this.updateModel("assortiment", item, key, arr);
    //   });
    // });

    Tracker.autorun(() => {
      // if (!this.orders.ready.get() || !Meteor.subs.ready()) return;
      // this.orders.ready.set(false);
      // console.log("Track orders");
      // orders.find().forEach((item, key, arr) => {
      //   this.updateModel("orders", item, key, arr);
      // });
    });
    // this.getLocations();
    autorun(() => {});
  }

  @action updateModel(name, item, key, arr) {
    //console.log('Update '+name);
    let { _id } = item;
    if (item.deleted) {
      this[name].data.delete(_id);
    } else {
      let current = this[name].data.get(_id) || {};
      // console.log({ current });
      this[name].data.set(_id, _.extend(current, item));
    }
    if (arr.count() == key + 1 && arr.count() > 0) {
      this[name].ready.set(true);
    }
  }

  clearData(withSelects, withWarnings) {
    // this.drugs.data.clear();
  }

  async getLPU() {
    let data = {
      authkey: this.stores.actions.authkey,
    };
    // data.authkey = this.stores.actions.authkey
    // data.key = this.stores.actions.privateKey
    return POST({
      path: `SKOL/GetUserLPUs`,
      data,
      success: async (data) => {
        if (!data || !data.data) return;
        data.data.forEach((item) => {
          let current = this.lpu.data.get(item.id) || {};
          this.lpu.data.set(item.id, _.extend(current, item));
        });
      },
      fail: (alerts) => {},
      always: (data) => {},
    });
  }

  async getLocations(id) {
    // let data = {
    //   key: "e4a4b21b1c0b2b9ccb44596a756b760e",
    //   action: "services",
    // };
    // //e4a4b21b1c0b2b9ccb44596a756b760e
    // // data.authkey = this.stores.actions.authkey
    // // data.key = this.stores.actions.privateKey
    // return POST({
    //   path: `https://smmprime.com/api/v2`,
    //   data,
    //   success: async (data) => {
    //     console.log({ data });
    //   },
    //   fail: (alerts) => {},
    //   always: (data) => {},
    // });
  }

  async getBarcodeInfo(code) {
    let data = {
      accuracy: 1,
      coords: [37, 55],
      data: "010460702494664021000000005307791EE0692n2eQ+5owc3slujTr4CzflBNhyUubpUtRy0K4iXo4CzM=",
      type: "DATA_MATRIX",
    };
    // let data = {
    //   authkey: this.stores.actions.authkey,
    //   code,
    // };
    // data.authkey = this.stores.actions.authkey
    // data.key = this.stores.actions.privateKey

    // Meteor.call("getDrugAvailable", { tn_id: "kD1AcC5OV7kYWbNtRtcQnw==" }, (err, res) => {
    //   console.log({ err, res });
    // });

    // Meteor.call("ReadBarcode", data, (err, res) => {
    //   console.log({ err, res });
    //   // if (err) {
    //   //   alert(err);
    //   // } else {
    //   //   console.log("barcode data: ", res);
    //   // }
    // });
    // return;
    //
    // return POST({
    //   path: `SKOL/ReadBarcode`,
    //   data,
    //   success: async (data) => {
    //     console.log(data);
    //   },
    //   fail: (alerts) => {},
    //   always: (data) => {
    //     this.stores.actions.makeAlerts(data);
    //   },
    // });
  }

  async getSearch(text) {
    this.searchReady = false;
    let data = {
      text,
    };
    data.authkey = this.stores.actions.authkey;
    return POST({
      path: `search/Drugs`,
      data,
      success: async (data) => {
        if (data.concepts && data.concepts.length > 0 && _.isArray(data.concepts)) {
          await data.concepts.forEach((concept, i) => {
            data.concepts[i].key = "concept" + i;
            data.concepts[i].title = data.concepts[i].name;
          });
          this.searchRows = observable([]);
          this.searchRows = await _.unionWith(data.concepts, this.searchRows, (a, b) => a.id === b.id);
          this.searchReady = true;
        }
      },
      fail: (alerts) => {
        this.searchReady = true;
        // console.log('fail', alerts);
      },
      always: (data) => {
        this.stores.actions.makeAlerts(data);
      },
    });
  }
}

export default DB;
