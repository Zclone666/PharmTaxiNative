import { observable, action, autorun, computed, runInAction } from "mobx";
import { GET, POST, PUT } from "../lib/connect";

import axios from "axios";
import moment from "moment";
import { meteorAsyncCall } from "../lib/helpers";

import { orders } from "/both/collections";

import _ from "lodash";

String.prototype.ucfirst = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
var subs = new SubsManager({
  cacheLimit: 1000,
  expireIn: 24 * 60,
});
Meteor.subs = subs;

class Orders {
  //start-decorators
  @observable ready = false;
  @observable drugs = {};
  @observable tmpOrder = {
    drugs: [],
  };

  //end-decorators

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.depAss = new Tracker.Dependency();
    // makeObservable(this);
    this.my = {
      data: observable.map({}, "assortiment"),
      count: observable.box(0),
      ready: observable.box(true),
    };

    // orders.find().observeChanges({
    //   added: (id, newDocument) => {
    //     console.log("added order", { newDocument });
    //     this.my.data.set(id, { _id: id, ...newDocument });
    //   },
    //   updated: (newDocument, oldDocument) => {
    //     console.log("updated 1");
    //     this.my.data.set(newDocument._id, newDocument);
    //   },
    //   changed: (id, newDocument) => {
    //     console.log("changed 1");
    //     this.my.data.set(id, { _id: id, ...newDocument });
    //   },
    //   removed: (newDocument) => {
    //     console.log("removed");
    //     this.my.data.remove(newDocument._id, newDocument);
    //   },
    // });
    orders.find().observe({
      added: (newDocument, oldDocument) => {
        // console.log("added order");
        this.my.data.set(newDocument.order_id, newDocument);
      },
      updated: (newDocument, oldDocument) => {
        // console.log("updated 1");
        this.my.data.set(newDocument.order_id, newDocument);
      },
      changed: (newDocument, oldDocument) => {
        // console.log("changed 1", newDocument, oldDocument);
        this.my.data.set(newDocument.order_id, newDocument);
      },
      removed: (newDocument) => {
        // console.log('removed');
        this.my.data.remove(newDocument.order_id, newDocument);
      },
    });
    Tracker.autorun(() => {
      this.depAss.depend();
      if (!this.my.ready.get() || !Meteor.subs.ready()) return;
      this.my.ready.set(false);
      console.log("Track orders");
      // orders.find().observe({
      //   added: (newDocument, oldDocument) => {
      //     console.log("added order");
      //     this.my.data.set(newDocument._id, newDocument);
      //   },
      //   updated: (newDocument, oldDocument) => {
      //     console.log("updated 1");
      //     this.my.data.set(newDocument._id, newDocument);
      //   },
      //   changed: (newDocument, oldDocument) => {
      //     console.log("changed 1");
      //     this.my.data.set(newDocument._id, newDocument);
      //   },
      //   removed: (newDocument) => {
      //     // console.log('removed');
      //     this.my.data.remove(newDocument._id, newDocument);
      //   },
      // });
    });
    autorun(() => {});
    this.subWithPharms();
  }

  subWithPharms = async () => {
    // let { res, err } = await meteorAsyncCall("assortimentCount");
    // // console.log({ res, err });
    // if (res) this.assortiment.count.set(res);
    subs.subscribe("pharmOrders", () => {
      this.depAss.changed();
    });
  };

  cancelOrder = async (id) => {
    let order = this.my.data.get(id);
    console.log({ id, order });
    let { res, err } = await meteorAsyncCall("cancelOrder", order);
    console.log({ res, err });
  };

  releaseOrder = async (id) => {
    let order = this.my.data.get(id);
    let { res, err } = await meteorAsyncCall("releaseOrder", order);
    console.log({ res, err });
  };

  makeReadyOrder = async (id) => {
    let order = this.my.data.get(id);
    let { res, err } = await meteorAsyncCall("makeReadyOrder", order);
    console.log({ res, err });
  };

  createTmpOrder = async () => {};

  changeTmpOrder = async (drug) => {
    if (drug.value == 0) {
      _.remove(this.tmpOrder.drugs, function (o) {
        return o.id == drug.pharm_pack_id;
      });
    } else {
      let i = _.findIndex(this.tmpOrder.drugs, function (o) {
        return o.id == drug.pharm_pack_id;
      });
      console.log({ i });
      if (i > -1) {
        this.tmpOrder.drugs[i].packs = drug.value;
      } else {
        this.tmpOrder.drugs.push({
          id: drug.pharm_pack_id,
          fp_id: drug.fp_id,
          packs: drug.value,
          name: drug.name,
          price: drug.price,
        });
      }
    }
  };

  saveTmpOrder = async () => {};

  clearTmpOrder = async () => {
    this.tmpOrder = {
      drugs: [],
    };
  };

  addUserToOrder = async (id) => {
    let order = this.my.data.get(id);
    if (!order.owner && order.user_id) {
      order.owner = await this.stores.user.getUserById(order.user_id);
    }
    this.my.data.set(id, order);
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
}
export default Orders;
