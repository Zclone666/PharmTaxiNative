import { observable, action, autorun, computed, runInAction } from "mobx";
import { GET, POST, PUT, API_SERVER } from "../lib/connect";

import axios from "axios";
import moment from "moment";
import { meteorAsyncCall } from "../lib/helpers";

import { assortiment, AvailableDrug } from "/both/collections";

import _ from "lodash";

String.prototype.ucfirst = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
var subs = new SubsManager({
  cacheLimit: 1000,
  expireIn: 24 * 60,
});
Meteor.subs = subs;

class Assortiment {
  //start-decorators
  @observable ready = false;
  @observable drugs = {};
  @observable skip = 0;
  @observable limit = 1000;
  @observable skip2 = 0;
  @observable uploading = false;
  @observable uploadProgress = 0;

  //end-decorators

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.depAss = new Tracker.Dependency();
    // makeObservable(this);
    this.assortiment = {
      data: observable.map({}, "assortiment"),
      count: observable.box(0),
      ready: observable.box(true),
    };

    Tracker.autorun(() => {
      this.depAss.depend();
      if (!this.assortiment.ready.get() || !Meteor.subs.ready()) return;
      // this.assortiment.ready.set(false);
      console.log("Track assortiment");
      assortiment
        .find(
          {}
          // { skip: 0 + this.skip2 }
        )
        .observe({
          added: (newDocument, oldDocument) => {
            // console.log("added 1");
            this.assortiment.data.set(newDocument._id, newDocument);
          },
          updated: (newDocument, oldDocument) => {
            // console.log("updated 1");
            this.assortiment.data.set(newDocument._id, newDocument);
          },
          removed: (newDocument) => {
            // console.log("removed");
            this.assortiment.data.remove(newDocument._id);
          },
        });
    });
    autorun(() => {});
    this.subWithPharms();
  }

  subWithPharms = async () => {
    let { skip, limit } = this;
    let { res, err } = await meteorAsyncCall("assortimentCount");
    console.log({ res, err });
    if (res) this.assortiment.count.set(res);
    subs.subscribe("assortiment", skip, limit, () => {
      this.depAss.changed();
    });
    this.skip = 0 + limit;
    // this.limit +=1000
  };

  addLoading = async ({ startIndex, stopIndex }) => {
    let { skip, limit } = this;
    if (skip >= startIndex) return;
    let tmp = Math.ceil(startIndex / 1000) * 1000;

    this.skip2 = 0 + this.skip;
    // this.skip = tmp
    // if (skip >= startIndex) return;
    console.log({ skip, tmp });
    subs.subscribe("assortiment", skip, tmp, () => {
      console.log("dep!");
      // this.depAss.changed();
    });
    this.skip = tmp;
    // this.skip = 0 + limit;
    // this.limit +=1000
  };

  getAvailable = async (item) => {
    let drug = {};

    let dosageClone = item.dosage.dosage ? _.cloneDeep(item.dosage.dosage) : [];

    if (item.type == "DV") {
      drug.dv_id = item.id;
    } else if (item.type == "TN") {
      drug.tn_id = item.id;
    }
    // console.log('here 1 2');
    if (item.fpid) drug.fp_id = item.fpid;
    if (item.dosage.form) drug.form_id = item.dosage.form;
    if (item.dosage.method) drug.method_id = item.dosage.method;
    if (dosageClone[0]) drug.dosage_id = parseInt(dosageClone[0].id_1);
    if (dosageClone[0]) drug.dosage_value = dosageClone[0].value_1;
    // console.log('here 1 3');
    if (this.drugs[item.key]) {
      if (this.drugs[item.key].subs && !this.drugs[item.key].subs.ready()) return;
      if (this.drugs[item.key].subs) this.drugs[item.key].subs.stop();
      // console.log('here 1 4');
    }

    this.drugs[item.key] = {
      drug,
      ready: false,
      packs: [],
    };

    // console.log({ drug });
    let myPharm = this.stores.user.currPharm || 0;
    Meteor.call("getAssortimentForDrug", drug, [myPharm], false, (err, res) => {
      if (res) {
        this.ready = false;

        res.forEach((resItem, i) => {
          // console.log({ resItem });
          this.drugs[item.key].packs.push(resItem);
          // let {_id, ...others} = resItem;
          // let subItem = {
          //   _id,
          //   packs: {
          //     [item.key]: others,
          //   },
          // };
          //
          // this.updateModel(
          //   'available',
          //   'added',
          //   subItem,
          //   'pharms',
          //   'AvailableInRadius',
          // );
          if (i == res.length - 1) {
            setTimeout(() => {
              this.ready = true;
              this.drugs[item.key].ready = true;
              // this.available.ready.set(true);
            }, 300);
          }
        });
      }
    });
  };
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
  change = async (id, data) => {
    let item = this.assortiment.data.get(id);
    if (data) {
      let { res, err } = await meteorAsyncCall("changeAssortiment", { ...item, ...data });
      if (res && res.code == "200") {
        return true;
      }
      this.stores.actions.makeAlerts({ alerts: [res] });
      console.log({ res, err });
      return false;
    } else {
      if (item) {
        let { res, err } = await meteorAsyncCall("changeAssortiment", item);
        if (res && res.code == "200") {
          return true;
        }
        this.stores.actions.makeAlerts({ alerts: [res] });
        console.log({ res, err });
        return false;
      }
    }
  };
  upload = (file, type = "Sync") => {
    this.uploading = true;
    let fd = new FormData();
    fd.append("operation", "LoadAssortment");
    fd.append("ForceLoad", true);
    fd.append("file", file);
    fd.append("files", [file]);
    fd.append("authkey", this.stores.user.authkey);
    fd.append("lang", "ru");

    axios
      .post(`${API_SERVER}/${type}`, fd, {
        // .post("http://192.168.14.158:50475/Post", fd, {
        onUploadProgress: (progressEvent) => {
          this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // console.log(percentCompleted);
        },
      })
      .then((response) => {
        this.uploading = false;
        this.uploadProgress = 0;
        this.stores.actions.makeAlerts({ alerts: [response.data] });
        if (response.data.level == "success") {
        }
        // console.log({ response });
      });

    // return POST({
    //   path: `Post`,
    //   options: {
    //     config: {
    //       headers: { "Content-Type": "multipart/form-data" },
    //     },
    //     onUploadProgress: (progressEvent) => {
    //       this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    //       // console.log(percentCompleted);
    //     },
    //   },
    //   headers: { "Content-Type": "multipart/form-data" },
    //   data,
    //
    //   success: async (data) => {
    //     console.log(data);
    //   },
    //   fail: (alerts) => {
    //     this.loading = false;
    //     console.log("FAIL", alerts);
    //   },
    //   always: (data) => {
    //     // this.stores.actions.makeAlerts(data);
    //     console.log("ALWAYS", data);
    //   },
    // });
  };
}
export default Assortiment;
