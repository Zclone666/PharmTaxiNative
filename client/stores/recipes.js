import { observable, action, autorun, computed } from "mobx";
import { GET, POST, PUT } from "../lib/connect";
import moment from "moment";

import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

import { meteorAsyncCall } from "../lib/helpers";
// import { Accounts } from "meteor/accounts-base";

import { assortiment, MedChest, orders, AvailableDrug } from "/both/collections";

// var subs = new SubsManager({
//   cacheLimit: 1000,
//   expireIn: 24 * 60,
// });
// Meteor.subs = subs;
// subs.subscribe("myFullUser");
// subs.subscribe("assortiment");

import _ from "lodash";

const colorPallette = ["#007b2b", "#b0d512", "#03529b", "#fff42b", "#ffca2f", "#fc7301", "#f42a03"];

class Recipes {
  @observable ready = true;
  @observable searchReady = true;

  @observable searchObj = { receiptCode: "", fio: "", birthdate: "", snils: "", searchType: "code" };

  @observable found = [];
  @observable current = {};
  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    autorun(() => {});
  }
  setCurrent = (code) => {
    this.found.forEach((rec, i) => {
      if (rec.recipe_code == code) {
        this.current = rec;
        rec.liquids.forEach((liq, i) => {
          if (liq.drugs)
            liq.drugs.forEach((drug, i) => {
              this.stores.dosages.get(drug, true, false);
            });
        });
      }
    });
  };
  search = async () => {
    this.ready = false;
    let { receiptCode, fio, birthdate, snils, searchType } = this.searchObj;
    let data = {};
    if (searchType == "code") data = { recipeId: receiptCode };
    if (searchType == "fio") data = { fio, birthdate };
    if (searchType == "snils") data = { snils };
    let { res, err } = await meteorAsyncCall("findRecipe", data);
    console.log({ res });
    if (!res || !res.recipes) {
      this.ready = true;
      return false;
    }
    if (res.recipes.length > 1) {
      res.recipes.forEach((rec, i) => {
        this.found.push(rec);
      });
    } else {
      this.current = res.recipes[0];
      this.found.push(res.recipes[0]);
      res.recipes[0].liquids.forEach((liq, i) => {
        if (liq.drugs)
          liq.drugs.forEach((drug, i) => {
            this.stores.dosages.get(drug, true, false);
          });
      });
    }
    // console.log({ recipe: res.recipes });
    this.ready = true;
    return this.current;
  };

  releaseDrug = async (drug, flag) => {
    let data = {
      pharmId: this.stores.user.currPharm,
      recipeId: this.current.recipe_code,
      recipeFullRelease: !!drug && !!drug.key ? false : true,
      releaseMedicaments: !drug || !drug.key ? false : true,
    };
    if (!!drug && !!drug.key) {
      data.drugStatuses = [
        {
          key: drug.key,
          idStatus: flag ? 2 : 1,
        },
      ];
    } else {
      data.fullReleaseStatus = 2;
    }

    let { res, err } = await meteorAsyncCall("setRecipeStatuses", data);
    // console.log({ res, err });
    if (res && res.code == "200") {
      // console.log("here 1");
      if (!!drug && !!drug.key) {
        // console.log("here 2", this.found);
        this.found.forEach((rec, f) => {
          // console.log("here 3");
          // console.log({ "rec.recipe_code": rec.recipe_code, "this.current.recipe_code": this.current.recipe_code });
          if (rec.recipe_code == this.current.recipe_code) {
            rec.liquids.forEach((liq, i) => {
              if (liq.drugs) {
                liq.drugs.forEach((idrug, x) => {
                  if (idrug.key == drug.key) {
                    this.found[f].liquids[i].drugs[x].idStatus = flag ? 2 : 1;
                    this.current = this.found[f];
                  }
                });
              }
            });
          }
        });
      } else {
        this.found.forEach((rec, f) => {
          if (rec.recipe_code == this.current.recipe_code) {
            this.found[f].idStatus = 2;
            this.current = this.found[f];
          }
        });
      }
    } else if (res) {
      this.stores.actions.makeAlerts({ alerts: [res] });
    } else if (err) {
      this.stores.actions.makeAlerts({ alerts: [err] });
    } else {
      this.stores.actions.makeAlerts({ alerts: [{ code: "500", message: "Ошибка!", level: "error" }] });
    }
  };

  // print = async () => {
  //   if (this.stores.actions.misurl && this.stores.actions.misurl.length > 0) this.stores.warnings.backToMis();
  //
  //   // this.stores.actions.loading = true
  //   let { active_language } = this.stores.actions;
  //   // await this.stores.db.clearData(false, true)
  //   // let data = await _.clone(this.stores.actions.drugStructure)
  //   // data.drugs = await Array.from(this.stores.drugs.drug.values())
  //   let data = {};
  //
  //   data.service = "43";
  //   data.active_language = active_language;
  //   data.authkey = this.stores.actions.authkey;
  //   data.key = this.stores.actions.privateKey;
  //   data.recipe = this.code;
  //   data.email = this.stores.actions.patientForm.email;
  //   return POST({
  //     path: "prescript/recipePrint", //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
  //     data,
  //     success: async (data) => {
  //       // console.log(data);
  //       return data.code;
  //     },
  //     fail: (alerts) => {
  //       this.stores.actions.loading = false;
  //     },
  //     always: (data) => {
  //       this.stores.actions.makeAlerts(data);
  //     },
  //   });
  // };
}

export default Recipes;
