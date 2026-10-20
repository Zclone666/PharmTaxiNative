import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check, Match } from "meteor/check";

import { dosages } from "../connections/ecp";
import {
  pharms,
  pharmsFD,
  assortiment,
  assortiment_small,
  concepts_cache,
  lics,
  pharmNets,
} from "../../both/collections";

import Future from "fibers/future";

import SERVER from "../../both/constants";
import { API_SERVER } from "../main";
// let output = new Meteor.Stream("output");

// output.permissions.read(function (userId, eventName) {
//   return true;
// });

let meteorAsyncCall = async (name, ...params) => {
  return new Promise((resolve, reject) =>
    Meteor.call(name, ...params, (err, res) => {
      resolve(res);
      // if (res) resolve({res, err});
      // if (err) reject({res, err});
    })
  );
};

Meteor.methods({
  cancelOrder: async function (order) {
    // console.log(order);
    // return;
    let future = new Future();

    const user = Meteor.user();
    if (!user || !user.services.PharmAuth.id) {
      return {
        error: new Meteor.Error("Вы не авторизованы!", "Вы не авторизованы!", "Вы не авторизованы!"),
      };
    }
    let authkey = user.services.PharmAuth.authkey;

    let odrerDummy = {
      pharmId: order.pharm_id.toString(),
      authkey,
      medicaments: order.drugs,
      recipe: order.order_id,
      status: "-1",
    };
    // const response = await
    fetch(`${API_SERVER}/WriteOff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(odrerDummy),
    })
      .then(async (response) => {
        // console.log(response);
        let res = await response.json();
        console.log({ res });
        // return res;
        // return response.json();
        future.return(res);
      })
      .catch((error) => {
        // let res = await response.json();
        console.log({ error });
        // return error;
        future.return({
          error: new Meteor.Error("123", error, error),
        });
      });
    // console.log(response);
    // if (response.error) {
    //   future.return({
    //     error: new Meteor.Error("123", response.error, response.error),
    //   });
    // } else {
    //   let res = await response.json();
    //   future.return(res);
    // }

    // return response;
    return future.wait();
  },
  releaseOrder: async function (order) {
    let future = new Future();

    const user = Meteor.user();
    if (!user || !user.services.PharmAuth.id) {
      return {
        error: new Meteor.Error("Вы не авторизованы!", "Вы не авторизованы!", "Вы не авторизованы!"),
      };
    }
    let authkey = user.services.PharmAuth.authkey;

    let odrerDummy = {
      pharmId: order.pharm_id.toString(),
      authkey,
      medicaments: order.drugs,
      recipe: order.order_id,
      status: "2",
    };
    // const response = await
    fetch(`${API_SERVER}/WriteOff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(odrerDummy),
    })
      .then(async (response) => {
        // console.log(response);
        let res = await response.json();
        console.log({ res });
        // return res;
        // return response.json();
        future.return(res);
      })
      .catch((error) => {
        // let res = await response.json();
        console.log({ error });
        // return error;
        future.return({
          error: new Meteor.Error("123", error, error),
        });
      });
    // console.log(response);
    // if (response.error) {
    //   future.return({
    //     error: new Meteor.Error("123", response.error, response.error),
    //   });
    // } else {
    //   let res = await response.json();
    //   future.return(res);
    // }

    // return response;
    return future.wait();
  },
  makeReadyOrder: async function (order) {
    let future = new Future();

    const user = Meteor.user();
    if (!user || !user.services.PharmAuth.id) {
      return {
        error: new Meteor.Error("Вы не авторизованы!", "Вы не авторизованы!", "Вы не авторизованы!"),
      };
    }
    let authkey = user.services.PharmAuth.authkey;

    let odrerDummy = {
      pharmId: order.pharm_id.toString(),
      authkey,
      medicaments: order.drugs,
      recipe: order.order_id,
      status: "1",
    };
    // const response = await
    fetch(`${API_SERVER}/WriteOff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(odrerDummy),
    })
      .then(async (response) => {
        // console.log(response);
        let res = await response.json();
        console.log({ res });
        // return res;
        // return response.json();
        future.return(res);
      })
      .catch((error) => {
        // let res = await response.json();
        console.log({ error });
        // return error;
        future.return({
          error: new Meteor.Error("123", error, error),
        });
      });
    // console.log(response);
    // if (response.error) {
    //   future.return({
    //     error: new Meteor.Error("123", response.error, response.error),
    //   });
    // } else {
    //   let res = await response.json();
    //   future.return(res);
    // }

    // return response;
    return future.wait();
  },
});
