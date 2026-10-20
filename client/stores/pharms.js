import { observable, action, autorun, computed } from "mobx";

import { GET, POST, PUT } from "../lib/connect";
import { meteorAsyncCall } from "../lib/helpers";
import axios from "axios";

import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
// import { Accounts } from "meteor/accounts-base";

import { assortiment, pharmsNets, pharmsFD, pharms, pharmNets } from "/both/collections";

import _ from "lodash";
import moment from "moment";

class Pharms {
  @observable ready = true;
  @observable licProcess = null;
  @observable searchReady = true;

  @observable currNet = {
    typeText: null,
    address: null,
    license: null,
    phone: null,
    title: null,
    PharmId: null,
  };
  @observable license = null;
  @observable currLic = {
    license: null,
    name: null,
    issuing: null,
    address: null,
    dateStart: null,
    dateEnd: null,
    ogrn: null,
    inn: null,
    order: null,
    orderFresh: null,
  };

  @observable licPharms = [];

  @observable searchObj = { receiptCode: "", fio: "", birthdate: "", snils: "", searchType: "code" };

  @observable current = {};
  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;
    this.depNets = new Tracker.Dependency();
    this.depPharms = new Tracker.Dependency();
    Meteor.subscribe("myPharmNets", () => {
      this.depNets.changed();
    });
    Meteor.subscribe("myPharms", () => {
      this.depPharms.changed();
    });

    Tracker.autorun(() => {
      this.depNets.depend();
      if (Meteor.loggingIn()) return;
      pharmNets.find().observe({
        added: (newDocument, oldDocument) => {
          console.log("added 1");
          this.nets.data.set(newDocument.PharmId, newDocument);
        },
        updated: (newDocument, oldDocument) => {
          console.log("updated 1");
          this.nets.data.set(newDocument.PharmId, newDocument);
        },
        removed: (newDocument) => {
          // console.log('removed');
          this.nets.data.remove(newDocument.PharmId, newDocument);
        },
      });
    });
    Tracker.autorun(() => {
      this.depPharms.depend();
      // if (Meteor.loggingIn()) return;
      pharms.find().observe({
        added: (newDocument, oldDocument) => {
          // console.log('added', newDocument);
          this.my.data.set(newDocument.PharmId, newDocument);
        },
        updated: (newDocument, oldDocument) => {
          // console.log('updated');
          this.my.data.set(newDocument.PharmId, newDocument);
        },
        removed: (newDocument) => {
          // console.log('removed');
          this.my.data.remove(newDocument.PharmId, newDocument);
        },
      });
    });

    this.my = {
      data: observable.map({}, "prarms"),
      ready: observable.box(true),
    };

    this.nets = {
      data: observable.map({}, "nets"),
      ready: observable.box(true),
    };

    autorun(() => {});
  }

  createPharmNet = async () => {
    const { meteorAsyncCall } = this.stores.tools;
    const { typeText, address, license, phone, title, PharmId } = this.currNet;

    let { res, err } = await meteorAsyncCall("createPharmNet", { typeText, address, license, phone, title });
    console.log({ res, err });
  };

  setCurrentLicense = (id) => {
    let netId = this.currNet.PharmId;
    let net = this.nets.data.get(parseInt(netId));
    let curr = { license: id };
    if (net && net.licenses) {
      net.licenses.forEach((lic, i) => {
        if (lic.license == id) curr = lic;
      });
    }
    this.license = id;

    this.currLic = curr;
    this.getLicensepharms(id);
  };

  setPharmNet = (id) => {
    let net = this.nets.data.get(parseInt(id));
    if (!net) return;
    const { TypeText, Address, License, Phone, Title, PharmId } = net;
    Object.assign(this.currNet, {
      typeText: TypeText,
      address: Address,
      license: License,
      phone: Phone,
      title: Title,
      PharmId: PharmId,
    });
    this.getPharmsByNet(id);
  };

  getPharmsByLicense = async (license) => {
    // console.log({license});
    this.ready = false;
    this.licProcess = "Получение сведений о лицензии...";
    let { res, err } = await meteorAsyncCall("checkLicense", license);
    console.log({ res, err });
    if (res && res.data && res.data[0]) {
      // this.licPharms = res.data[0].objects;
      this.licProcess = "Получение информации об аптеках...";
      Object.assign(this.currLic, {
        license: res.data[0].col1.label,
        name: res.data[0].col3.title,
        issuing: res.data[0].col4.label,
        address: res.data[0].col5.label,
        dateStart: res.data[0].col11.label,
        dateEnd: res.data[0].col12.label,
        ogrn: res.data[0].col6.label,
        inn: res.data[0].col7.label,
        order: res.data[0].col10.label,
        orderFresh: res.data[0].col18.label,
      });
      let addressList = [];
      res.data[0].objects.forEach((item, i) => {
        // console.log({ item });
        addressList.push(item.address_fact);
      });
      this.licPharms = res.data[0].objects;
      let coords = await this.getByAddress(addressList);
      this.licProcess = "Обработка результатов...";
      // let coordsList = await this.getByAddress(adressList);
      console.log({ coords });
      let finalList = [];
      res.data[0].objects.forEach((pharm, i) => {
        // _.findLast(res.data[0].objects, { address_fact: pharm.item });

        finalList.push(
          Object.assign(_.findLast(coords, { address_fact: pharm.address_fact }) || {}, {
            ...pharm,
            name: `Аптека ${this.currNet.typeText || ""} ${pharm.id}`,
          })
        );
        // res.data[0].objects
        // adressList.push(item.address_fact)
      });
      this.licPharms = finalList;

      this.ready = true;
    }
  };

  getByAddress = async (adressList, list = [], count = 0) => {
    const { meteorAsyncCall } = this.stores.tools;

    let addressLists = _.chunk(adressList, 50);
    // let coordsList = [];
    this.licProcess = `Получение информации об аптеках... ${count * 50} из ${adressList.length}`;
    let { res, err } = await meteorAsyncCall("checkAddress", addressLists[count]);
    // console.log({ res, err });
    list = [...list, ...res];

    if (addressLists.length > 0 && count < addressLists.length) {
      count++;
      this.licProcess = `Получение информации об аптеках... ${count * 50} из ${adressList.length}`;
      return this.getByAddress(adressList, list, count);
    } else {
      return list;
    }
    // console.log({ res, err });
  };

  addLicenseWithPharms = async () => {
    let pharms = [];
    this.licPharms.forEach((pharm, i) => {
      let { location, days, ...others } = pharm;

      if (location && location[0] && !!days) {
        let longitude = location[0];
        let latitude = location[1];
        pharms.push({
          latitude,
          longitude,
          ...others,
          mon: days.mon,
          tue: days.tue,
          wed: days.wed,
          thu: days.thu,
          fri: days.fri,
          sat: days.sat,
          sun: days.sun,
        });
      }
    });
    console.log({ license: this.currLic, pharms });
    let { res, err } = await meteorAsyncCall("addLicenseWithPharms", {
      license: _.cloneDeep(this.currLic),
      pharms,
      net: _.cloneDeep(this.currNet),
    });
    console.log({ res, err });
  };

  getNetLicenses = async (id) => {
    let { res, err } = await meteorAsyncCall("getNetLicenses", id);
    console.log({ res, err });
    if (res && res.length) {
      let net = this.nets.data.get(id);
      net.licenses = res;
    }
  };

  getLicensepharms = async (id) => {
    let { res, err } = await meteorAsyncCall("getLicensepharms", id);
    console.log({ res, err });

    if (res && res.length) {
      this.licPharms = res;
    }
  };

  getPharmsByNet = async (id) => {
    let { res, err } = await meteorAsyncCall("getPharmsByNet", id);
    console.log({ res, err });

    if (res && res.length) {
      res.forEach((item, i) => {
        this.my.data.set(item.PharmId, item);
      });
    }
  };

  createInvite = async () => {
    let { email, pharmId, firstname, lastname, patronymic } = this.stores.actions.inviteForm;
    let pharm = this.my.data.get(parseInt(pharmId));
    let { res, err } = await meteorAsyncCall("createInvite", {
      firstname,
      lastname,
      patronymic,
      email,
      pharmId: pharm._id,
    });
    console.log({ res, err });
  };
}

export default Pharms;
