import fetch from 'node-fetch';
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

let getByAddress = async (callback, token, adressList, list = [], count = 0) => {
  // console.log({ token, adressList, list, count });
  if (!adressList) return callback([]);
  const response = await fetch(
    `https://api-maps.yandex.ru/services/search//v2/?callback=id_1627478880276652115015&text=${encodeURI(
      adressList[count]
    )}&format=json&rspn=0&lang=ru_RU&token=${token}&type=geo&properties=addressdetails&geocoder_sco=latlong&origin=jsapi2Geocoder&apikey=1397126c-7448-409c-9ae1-51ddfd4f8c63`,
    {
      method: "GET",
      headers: {
        Referer: "https://pharm.taxi/",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    }
  );
  let res = await response.text();
  res = await JSON.parse(res.replace("/**/id_1627478880276652115015(", "").replace(");", ""));
  // res = res.replace(");", "");
  // if (!res.data.features[0]) console.log(JSON.stringify(res));

  let location = res && res.data && res.data.features[0] && res.data.features[0].geometry.coordinates;

  // console.log({ coords }, count);
  list.push({ address_fact: adressList[count], location });
  count++;
  if (adressList.length > 0 && count < adressList.length) {
    return getByAddress(callback, token, adressList, list, count);
    // return this.getByAddress(adressList, list, count);
  } else {
    return callback(list);
  }
  // console.log({ res, err });
};

import _ from "lodash";

let lookUps = {
  pharmsOnRadius: {
    $lookup: {
      from: "warehouses",
      let: { order_item: "$item", order_qty: "$ordered" },
      pipeline: [
        {
          $match: {
            $expr: { $and: [{ $eq: ["$stock_item", "$$order_item"] }, { $gte: ["$instock", "$$order_qty"] }] },
          },
        },
        { $project: { stock_item: 0, _id: 0 } },
      ],
      as: "stockdata",
    },
  },
  assortimentForPharm: {
    $lookup: {
      from: "assortiment_small",
      localField: "PharmId",
      foreignField: "pharm_id",
      as: "pharm_packs",
    },
  },
  geoSearch: {
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [37.6156, 55.7522],
      },
      spherical: true,
      maxDistance: 4000,
      //  query: { PharmId: { $in: [3122, 336] } },
      distanceField: "calcDistance",
    },
  },
};

Meteor.methods({
  getUserById(user_id) {
    if (!Meteor.userId()) return {};
    return Meteor.users.findOne({ $or: [{ "services.AppGuestAuth.id": user_id }, { "services.AppAuth.id": user_id }] });
  },

  getDosage: async function (drug) {
    const authkey = Meteor.user() && Meteor.user().services.AppGuestAuth && Meteor.user().services.AppGuestAuth.authkey;
    console.log("getDosage");
    let data = {
      authkey,
      drug,
      active_language: "ru",
    };
    console.log({ drug });
    // Meteor.wrapAsync(() => {
    //   return dosages.findOne({ idenc: drug.id });
    // });
    // console.log({ idenc: drug.id });
    // let rawDosages = dosages.rawCollection();
    // let aggregateQuery = Meteor.wrapAsync(rawDosages.aggregate, rawDosages);
    // let isCache = await aggregateQuery(
    //   [
    //     {
    //       $match: { idenc: drug.id },
    //     },
    //   ],
    //   { cursor: {} }
    // ).toArray();

    let isCache = await dosages.findOne({ idenc: drug.id });
    console.log({ isCache });
    if (!isCache) {
      const response = HTTP.post(`${API_SERVER}/drugs/CreateDosage`, {
        data,
      });
       console.log({ response });
      if (response) isCache = { answer: JSON.parse(response.content) };
      console.log({ isCache });
    }
    return isCache;
  },

  getDrugInfo: function (drug) {
    const authkey = Meteor.user() && Meteor.user().services.AppGuestAuth && Meteor.user().services.AppGuestAuth.authkey;

    let data = {
      authkey: null,
      drug,
      active_language: "ru",
    };
    // console.log(data);
    const response = HTTP.post(`${API_SERVER}/drugs/Info`, {
      data,
    });
    //.replaceAll("<[^>]*>", "");
    // console.log({ response });
    if (response) return JSON.parse(response.content);
    return {};
  },

  async checkMusthave({ fp_id, tn_id, dv_id }) {
    const response = await fetch(`${API_SERVER}/CheckMustHave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fp_id, tn_id, dv_id }),
    }).then((response) => {
      return response.json();
    });
    return response;
  },

  getPharms(region) {
    let { longitudeMin, longitudeMax, latitudeMin, latitudeMax } = region;

    let rawPharms = pharmsFD.rawCollection();
    // let aggregateQuery = Meteor.wrapAsync(rawPharms.aggregate, rawPharms);

    return rawPharms
      .aggregate(
        [
          {
            $match: {
              location: {
                $geoWithin: {
                  $box: [
                    [longitudeMin, latitudeMin],
                    [longitudeMax, latitudeMax],
                  ],
                },
              },
            },
          },

          {
            $group: {
              _id: { $toString: "$PharmId" },
              location: { $first: "$location" },
              // address: { $first: "$Address" },
              // name: { $first: "$Title" },
              // phone: { $first: "$Phone" },
              // distance: { $first: "$calcDistance" },
              // latitude: { $first: "$latitude" },
              // longitude: { $first: "$longitude" },
              isActive: { $first: "$IsActive" },
            },
          },
          {
            $addFields: {
              longitude: { $arrayElemAt: ["$location", 0] },
              latitude: { $arrayElemAt: ["$location", -1] },
            },
          },
        ],
        { cursor: {} }
      )
      .toArray();
    //   region: {
    //     latitude: 55.71907858060975,
    //     latitudeDelta: 0.17776829119895865,
    //     longitude: 37.36781632527709,
    //     longitudeDelta: 0.5386167392134666,
    //   },
  },

  async getAllPharms(skip, limit) {
    let rawPharms = pharmsFD.rawCollection();
     let aggregateQuery = Meteor.wrapAsync(rawPharms.aggregate, rawPharms);
     try
    {
    console.log("\ngetAllPharms pharmsFD count: "+rawPharms.length);
    }
    catch{
      //console.log("\ngetAllPharms pharmsFD count: %d", rawPharms.aggregate().toArray().length);
    }
    try
    {
    //console.log("\ngetAllPharms pharmsFD count: "+rawPharms.aggregate().toArray().length);
    //console.log("\n"+aggregateQuery+"\n");
    }
    catch{}
    console.log("\ngetAllPharms\n");
    let test = await rawPharms.aggregate(
        [
          { $skip: skip },
          { $limit: limit },
          // {
          //     $geoNear: {
          //        near: { type: "Point", coordinates: [ -73.9667, 40.78 ] },
          //        spherical: true,
          //        query: { category: "Parks" },
          //        distanceField: "calcDistance"
          //     }
          //  },
          {
            $group: {
              _id: { $toString: "$PharmId" },
              location: { $first: "$location" },
              // address: { $first: "$Address" },
              // name: { $first: "$Title" },
              // phone: { $first: "$Phone" },
              // distance: { $first: "$calcDistance" },
              // latitude: { $first: "$latitude" },
              // longitude: { $first: "$longitude" },
              isActive: { $first: "$IsActive" },
            },
          },
          {
            $addFields: {
              longitude: { $arrayElemAt: ["$location", 0] },
              latitude: { $arrayElemAt: ["$location", -1] },
            },
          },
        ],
        { cursor: {} }
      )
      .toArray();
   // console.log(test);
    return test;
    //   region: {
    //     latitude: 55.71907858060975,
    //     latitudeDelta: 0.17776829119895865,
    //     longitude: 37.36781632527709,
    //     longitudeDelta: 0.5386167392134666,
    //   },
  },

  getPharm(PharmId) {
    return pharms.findOne({ PharmId });
  },

  getPharmsAssortiment(PharmId, drugs) {
    if (!Meteor.user()) return [];
    const { distance, analogs, fullList, partners } = Meteor.user();

    let matches = { PharmId };
    if (fullList) {
      matches.$and = [];
    } else {
      matches.$or = [];
    }

    drugs.forEach((drug, i) => {
      let { fp_id, tn_id, dv_id, method_id, form_id, dosage_id, dosage_value } = drug;
      let matchItem = {};
      if (method_id) matchItem["pharm_packs.method_id"] = method_id;
      if (form_id) matchItem["pharm_packs.form_id"] = form_id;
      if (dosage_id) matchItem["pharm_packs.dosage_id"] = dosage_id;
      if (dosage_value) matchItem["pharm_packs.dosage_value"] = dosage_value;
      if (analogs) {
        matchItem.$or = [];

        if (dv_id) matchItem.$or.push({ "pharm_packs.dv_id": dv_id });
        if (tn_id) matchItem.$or.push({ "pharm_packs.tn_id": tn_id });
        if (fp_id) matchItem.$or.push({ "pharm_packs.fp_id": fp_id });
      } else {
        if (tn_id) matchItem["pharm_packs.tn_id"] = tn_id;
        if (dv_id) matchItem["pharm_packs.dv_id"] = dv_id;
        if (fp_id) matchItem["pharm_packs.fp_id"] = fp_id;
      }
      if (fullList) {
        matches.$and.push(matchItem);
      } else {
        matches.$or.push(matchItem);
      }
    });

    let rawPharms = pharmsFD.rawCollection();

    return rawPharms
      .aggregate(
        [
          {
            $match: {
              location: {
                $geoWithin: {
                  $box: [
                    [longitudeMin, latitudeMin],
                    [longitudeMax, latitudeMax],
                  ],
                },
              },
            },
          },
          {
            $unwind: {
              path: "$pharm_packs",
              preserveNullAndEmptyArrays: true,
            },
          },
          lookUps.assortimentForPharm,
          {
            $unwind: {
              path: "$pharm_packs",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: matches,
          },
          {
            $group: {
              _id: { $toString: "$PharmId" },
              distance: { $first: "$calcDistance" },
              location: { $first: "$location" },
              packs: {
                $push: {
                  price: "$pharm_packs.price",
                  fp_id: "$pharm_packs.fp_id",
                  dv_id: "$pharm_packs.dv_id",
                  tn_id: "$pharm_packs.tn_id",
                  available: "$pharm_packs.qty_free",
                },
              },
              isActive: { $first: "$IsActive" },

              packsCount: { $sum: 1 },
            },
          },
          {
            $addFields: {
              longitude: { $arrayElemAt: ["$location", 0] },
              latitude: { $arrayElemAt: ["$location", -1] },
            },
          },
        ],
        { cursor: {} }
      )
      .toArray();
  },

  getPharmWithAssortiment(pharm_id, drugs) {
    if (!Meteor.user()) return [];
    const { distance, analogs, fullList, partners } = Meteor.user();

    const isDrugs = drugs.length > 0;

    let matches = { pharm_id };
    if (fullList) {
      if (isDrugs) {
        matches.$and = [];
      }
    } else {
      if (isDrugs) {
        matches.$or = [];
      }
    }

    // let s = {
    //   $and: [
    //     {
    //       "pharm_packs.form_id": "+qbdqiTg3nODLu1K4yKQDQ==",
    //       "dv_id": "6HcfXghaGmW5Vnw34YcKPA==",
    //       "fp_id": "fd9Em44I8Pf2KA1q+auEOQ==",
    //     },
    //   ],
    // };

    drugs.forEach((drug, i) => {
      console.log({ drug });
      let { key, fp_id, tn_id, dv_id, method_id, form_id, dosage_id, dosage_value } = drug;
      let matchItem = {};
      if (method_id) matchItem["method_id"] = method_id;
      if (form_id) matchItem["form_id"] = form_id;
      if (dosage_id) matchItem["dosage_id"] = dosage_id;
      if (dosage_value) matchItem["dosage_value"] = dosage_value;
      if (analogs) {
        if (!dv_id && tn_id) {
          let drugFull = assortiment_small.findOne({ tn_id });
          if (drugFull) {
            drugs[i].dv_id = drugFull.dv_id;
            dv_id = drugFull.dv_id;
          }
        }
        matchItem.$or = [];
        if (dv_id) matchItem.$or.push({ dv_id: dv_id });
        if (tn_id) matchItem.$or.push({ tn_id: tn_id });
        if (fp_id) matchItem.$or.push({ fp_id: fp_id });
      } else {
        if (tn_id) matchItem["tn_id"] = tn_id;
        if (dv_id) matchItem["dv_id"] = dv_id;
        if (fp_id) matchItem["fp_id"] = fp_id;
      }
      if (fullList) {
        matches.$and.push(matchItem);
      } else {
        matches.$or.push(matchItem);
      }
    });

    matches.qty_free = { $gt: 0 };

    let pharm = pharms.findOne({ PharmId: pharm_id });
    let packs = isDrugs ? assortiment.find(matches).fetch() : [];

    packs.forEach((pack, i) => {
      let key = null;
      drugs.forEach((drug, x) => {
        if (drug.fp_id == pack.fp_id) key = drug.key;
      });
      if (!packs[i].key) packs[i].key = key;
    });
    packs.forEach((pack, i) => {
      let key = null;
      drugs.forEach((drug, x) => {
        if (drug.tn_id == pack.tn_id) key = drug.key;
      });
      if (!packs[i].key) packs[i].key = key;
    });
    packs.forEach((pack, i) => {
      let key = null;
      drugs.forEach((drug, x) => {
        if (drug.dv_id == pack.dv_id) key = drug.key;
      });
      if (!packs[i].key) packs[i].key = key;
    });

    return { packs, pharm };
  },

  getDrugAvailable(drug) {
    // check(drug, Object);
    if (!Meteor.user()) return [];
    const { distance, analogs, fullList, partners } = Meteor.user();
    // const rules = {
    //   fullList: false,
    //   analogs: true,
    // };

    let matches = {};
    if (fullList) {
      matches.$and = [];
    } else {
      matches.$or = [];
    }

    let { fp_id, tn_id, dv_id, method_id, form_id, dosage_id, dosage_value } = drug;
    let matchItem = {};
    if (method_id) matchItem["method_id"] = method_id;
    if (form_id) matchItem["form_id"] = form_id;
    if (dosage_id) matchItem["dosage_id"] = dosage_id;
    if (dosage_value) matchItem["dosage_value"] = dosage_value;
    if (analogs) {
      if (!dv_id && tn_id) {
        let drugFull = assortiment_small.findOne({ tn_id });
        dv_id = drugFull.dv_id;
      }
      matchItem.$or = [];

      if (dv_id) matchItem.$or.push({ dv_id: dv_id });
      if (tn_id) matchItem.$or.push({ tn_id: tn_id });
      if (fp_id) matchItem.$or.push({ fp_id: fp_id });
    } else {
      if (tn_id) matchItem["tn_id"] = tn_id;
      if (dv_id) matchItem["dv_id"] = dv_id;
      if (fp_id) matchItem["fp_id"] = fp_id;
    }

    matchItem.qty_free = { $gt: 0 };

    matches = matchItem;

    // console.log(matches);

    let rawPharms = assortiment_small.rawCollection();

    return rawPharms
      .aggregate(
        [
          {
            $match: matches,
          },
          {
            $group: {
              _id: { $toString: "$pharm_id" },
              minPrice: { $min: "$price" },
              // packs: {
              //   $push: {
              //     price: { $toString: "$price" },
              //     fp_id: "$fp_id",
              //     dv_id: "$dv_id",
              //     tn_id: "$tn_id",
              //     available: "$qty_free",
              //   },
              // },
              packsCount: { $sum: 1 },
            },
          },
        ],
        { cursor: {} }
      )
      .toArray();
  },

  userChoicePharm(pharm) {
    let user = Meteor.user();
    if (!user)
      return {
        error: new Meteor.Error("Вы не авторизованы", {}, {}),
      };

    return Meteor.users.update({ _id: user._id }, { $set: { currPharm: pharm } });
  },

  getAssortimentForDrug(drug, pharms, analogs = false) {
    // check(drug, Object);
    if (!Meteor.user()) return [];
    // const { distance, analogs, fullList, partners } = Meteor.user();
    // const rules = {
    //   fullList: false,
    //   analogs: true,
    // };
    let fullList = false;

    let matches = {};
    // if (fullList) {
    //   matches.$and = [];
    // } else {
    //   matches.$or = [];
    // }

    let { fp_id, tn_id, dv_id, method_id, form_id, dosage_id, dosage_value } = drug;

    let matchItem = {};
    if (method_id) matchItem["method_id"] = method_id;
    if (form_id) matchItem["form_id"] = form_id;
    if (dosage_id) matchItem["dosage_id"] = dosage_id;
    if (dosage_value) matchItem["dosage_value"] = dosage_value;

    if (pharms && pharms.length > 0) matchItem.pharm_id = { $in: pharms };

    if (analogs) {
      if (!dv_id && tn_id) {
        let drugFull = assortiment_small.findOne({ tn_id });
        dv_id = drugFull.dv_id;
      }
      matchItem.$or = [];

      if (dv_id) matchItem.$or.push({ dv_id: dv_id });
      if (tn_id) matchItem.$or.push({ tn_id: tn_id });
      if (fp_id) matchItem.$or.push({ fp_id: fp_id });
    } else {
      if (tn_id) matchItem["tn_id"] = tn_id;
      if (dv_id) matchItem["dv_id"] = dv_id;
      if (fp_id) matchItem["fp_id"] = fp_id;
    }

    matchItem.qty_free = { $gt: 0 };

    matches = matchItem;

    console.log(matches);

    let rawPharms = assortiment.rawCollection();

    let result = rawPharms
      .aggregate(
        [
          {
            $match: matches,
          },
          // {
          //   $group: {
          //     _id: { $toString: "$pharm_id" },
          //     minPrice: { $min: "$price" },
          //     // packs: {
          //     //   $push: {
          //     //     price: { $toString: "$price" },
          //     //     fp_id: "$fp_id",
          //     //     dv_id: "$dv_id",
          //     //     tn_id: "$tn_id",
          //     //     available: "$qty_free",
          //     //   },
          //     // },
          //     packsCount: { $sum: 1 },
          //   },
          // },
        ],
        { cursor: {} }
      )
      .toArray();
    console.log(result);
    return result;
  },

  async getRecipes() {
    if (!Meteor.userId())
      return {
        error: new Meteor.Error(400, "Вы не авторизованы"),
      };
    const user = Meteor.user();
    let authkey = user.services.AppAuth && user.services.AppAuth.authkey;
    // console.log({ user });
    let email = (user.patient && user.patient.email) || user.emails[0] || null;
    // console.log({
    //   email,
    //   authkey,
    // });
    const response = await fetch(`${API_SERVER}/Recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        authkey,
      }),
    }).then((response) => {
      // console.log(JSON.stringify(response.json()));
      return response.json();
    });
    // console.log(JSON.stringify(response.json()));
    return response;
    // console.log(recipes);
  },

  async findRecipe(data) {
    let future = new Future();
    console.log({ data });
    // const response = await
    console.log(API_SERVER);
    fetch(`${API_SERVER}/SearchRecipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        // console.log(response);
        let res = await response.json();
        // console.log({ res: JSON.stringify(res) });
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

  async setRecipeStatuses({
    pharmId,
    recipeId,
    recipeFullRelease,
    fullReleaseStatus,
    releaseMedicaments,
    drugStatuses,
  }) {
    if (!Meteor.userId())
      return {
        error: new Meteor.Error(400, "Вы не авторизованы"),
      };
    const user = Meteor.user();
    let authkey = user.services.PharmAuth && user.services.PharmAuth.authkey;
    // console.log({ user });
    // let email = (user.patient && user.patient.email) || user.emails[0] || null;
    // console.log({
    //   email,
    //   authkey,
    // });
    let data = {
      authkey,
      pharmId,
      recipeId,
      recipeFullRelease,
      releaseMedicaments,
    };
    if (drugStatuses) {
      data.drugStatuses = drugStatuses;
    }
    if (fullReleaseStatus) {
      data.fullReleaseStatus = fullReleaseStatus;
    }
    let d = {
      authkey: "",
      recipeId: "92Q",
      pharmId: 0,
      pharmName: "аптечка",
      recipeFullRelease: false,
      releaseMedicaments: true,
      drugStatuses: [
        {
          key: "Drug_0002",
          idStatus: 3,
          medicaments: [
            {
              id: "OX/R1LlhUWCmIAAhggmSGg==",
              packs: 1,
              price: 105,
            },
          ],
        },
        {
          key: "Drug_0003",
          idStatus: 1,
        },
      ],
    };

    console.log(data);
    const response = await fetch(`${API_SERVER}/RecipeRelease`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => {
      // console.log(JSON.stringify(response.json()));
      return response.json();
    });
    // console.log(JSON.stringify(response.json()));
    return response;
    // console.log(recipes);
  },

  async getActual() {
    if (!Meteor.userId())
      return {
        error: new Meteor.Error(400, "Вы не авторизованы"),
      };
    const user = Meteor.user();
    let authkey = user.services.AppAuth && user.services.AppAuth.authkey;
    let email = (user.patient && user.patient.email) || user.emails[0] || null;

    const response = await fetch(`${API_SERVER}/Actual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        authkey,
      }),
    }).then((response) => {
      return response.json();
    });
    return response;
    // console.log(recipes);
  },

  getConceptsCount() {
    return concepts_cache.count();
  },

  async getPharmsCount() {
    return await pharmsFD.rawCollection().aggregate([
          {
            $group: {
              _id: { $toString: "$PharmId" },
              location: { $first: "$location" },
              // address: { $first: "$Address" },
              // name: { $first: "$Title" },
              // phone: { $first: "$Phone" },
              // distance: { $first: "$calcDistance" },
              // latitude: { $first: "$latitude" },
              // longitude: { $first: "$longitude" },
              isActive: { $first: "$IsActive" },
            },
          },
          {
            $addFields: {
              longitude: { $arrayElemAt: ["$location", 0] },
              latitude: { $arrayElemAt: ["$location", -1] },
            },
          },
        ],
        { cursor: {} }).toArray().length;
  },

  async getConcepts(hash) {
    let fut = new Future();
    // console.log(Future);
    Meteor.call("getHash", "concepts_cache", async (err, res) => {
      if (res && hash == res) {
        fut.return(false);
        return false;
      }

      let rawConcepts = concepts_cache.rawCollection();

      let obj = {};

      await rawConcepts.aggregate([], { cursor: {} }).forEach((item, i) => {
        if (item && item.name) {
          let { _id, fpid, group, key, main, namesearch, type, id, level, name } = item;
          name = name.toLowerCase().trim();
          let letter = name.substring(0, 1);
          if (obj[letter] && obj[letter].length > 0) {
            obj[letter].push({
              name,
              type,
              id,
              level,
            });
          } else {
            obj[letter] = [
              {
                name,
                type,
                id,
                level,
              },
            ];
          }
        }
      });
      fut.return(obj);
      // return obj;
    });
    return fut.wait();
  },

  cmd(command, command2) {
    fut = new Future();

    let explode = command.split(" ");
    let cmd = explode[0];
    let args = explode.splice(1, explode.length);

    let explode2 = command2.split(" ");
    let cmd2 = explode2[0];
    let args2 = explode2.splice(1, explode2.length);
    //console.log("e:"+cmd+JSON.stringify(args));

    let spawn = Npm.require("child_process").spawn;
    // if (args.length == 0) ls = spawn(cmd);
    // else ls = spawn(cmd, args);

    let ls = spawn(cmd, args);
    // let hash = spawn(cmd2, args2);
    // console.log({ls});

    ls.stdout.on("data", (data) => {
      // console.log(command2)
      console.log("out: " + data);
      if ("" + data == "WARNING: shell and server versions do not match") {
        console.log("HERE");
        fut.ret(data);
        ls.stdin.write(command2);
      }
      // output.emit("data", data);
    });
    // hash.stdout.on("data", (data) => {
    //   console.log("out: " + data);
    //   // if (("" + data) == "WARNING: shell and server versions do not match") fut.ret(data);
    //   // output.emit("data", data);
    // });

    ls.stderr.on("data", (data) => {
      console.log("err: " + data);
      if (fut && fut.ret) fut.ret(data);
      // output.emit("data", data);
    });

    ls.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
    ls.on("error", (code) => {
      console.log(`child process exited with error ${code}`);
    });

    return fut.wait();
  },

  getHash(name) {
    let fut = new Future();
    console.log(name);
    const { promisify } = require("util");
    const exec = promisify(require("child_process").exec);
    // console.log(name);
    exec(
      `mongo "mongodb://pht:pht2021@mongodb.socmedica.com:27027/PHTForSLF?authSource=admin&replicaSet=prod&readPreference=secondaryPreferred" --eval "db.runCommand({dbHash:1,collections:['${name}']})" --quiet`
    )

      .then((res) => {
        let result = res.stdout
          .replace(",\"",",'")
          .replace(/\"\)/gi,"')")
          .replace("\n", "")
          .replace("\t", "")
          .replace("UUID(\"","\"UUID('")
         // .replace(/UUID\([\w\D]*\)/gi, '""')
          .replace(" Timestamp", " \"Timestamp")
          .replace(" BinData", " \"BinData")
          .replace(" NumberLong", " \"NumberLong")
          .replace(/\)/gi, ')"')
//          .replace("0)","0)\"")
          .replace(" Timestamp", " \"Timestamp");
     //     result+='}';
         console.log(result);
        // return res;
        result = JSON.parse(result);
        // console.log(result);
        fut.return(result.collections[name]);
      })
      .catch((err) => {
        console.error(err);
        fut.return(err);
        // process.exit(1);
      });

    // return result.collections[name];

    return fut.wait();
  },

  async checkLicense(lic) {
    let future = new Future();
    const response = await fetch("https://roszdravnadzor.gov.ru/ajax/services/licenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      // mode: "cors", // no-cors, *cors, same-origin
      // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: "same-origin", // include, *same-origin, omit
      //
      // redirect: "follow", // manual, *follow, error
      // referrerPolicy: "strict-origin-when-cross-origin", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url

      body: `draw=4&columns%5B0%5D%5Bdata%5D=col1.label&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=col2.label&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=col3.label&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=col4.label&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=false&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=col5.label&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=false&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=col6.label&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=false&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=col7.label&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=false&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=col8.label&columns%5B7%5D%5Bname%5D=&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=false&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5Bdata%5D=col9.label&columns%5B8%5D%5Bname%5D=&columns%5B8%5D%5Bsearchable%5D=true&columns%5B8%5D%5Borderable%5D=false&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B9%5D%5Bdata%5D=col10.label&columns%5B9%5D%5Bname%5D=&columns%5B9%5D%5Bsearchable%5D=true&columns%5B9%5D%5Borderable%5D=false&columns%5B9%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B9%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B10%5D%5Bdata%5D=col11.label&columns%5B10%5D%5Bname%5D=&columns%5B10%5D%5Bsearchable%5D=true&columns%5B10%5D%5Borderable%5D=false&columns%5B10%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B10%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B11%5D%5Bdata%5D=col12.label&columns%5B11%5D%5Bname%5D=&columns%5B11%5D%5Bsearchable%5D=true&columns%5B11%5D%5Borderable%5D=false&columns%5B11%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B11%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B12%5D%5Bdata%5D=col13.label&columns%5B12%5D%5Bname%5D=&columns%5B12%5D%5Bsearchable%5D=true&columns%5B12%5D%5Borderable%5D=false&columns%5B12%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B12%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B13%5D%5Bdata%5D=col14.label&columns%5B13%5D%5Bname%5D=&columns%5B13%5D%5Bsearchable%5D=true&columns%5B13%5D%5Borderable%5D=false&columns%5B13%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B13%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B14%5D%5Bdata%5D=col15.label&columns%5B14%5D%5Bname%5D=&columns%5B14%5D%5Bsearchable%5D=true&columns%5B14%5D%5Borderable%5D=false&columns%5B14%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B14%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B15%5D%5Bdata%5D=col16.label&columns%5B15%5D%5Bname%5D=&columns%5B15%5D%5Bsearchable%5D=true&columns%5B15%5D%5Borderable%5D=false&columns%5B15%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B15%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B16%5D%5Bdata%5D=col17.label&columns%5B16%5D%5Bname%5D=&columns%5B16%5D%5Bsearchable%5D=true&columns%5B16%5D%5Borderable%5D=false&columns%5B16%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B16%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B17%5D%5Bdata%5D=col18.label&columns%5B17%5D%5Bname%5D=&columns%5B17%5D%5Bsearchable%5D=true&columns%5B17%5D%5Borderable%5D=false&columns%5B17%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B17%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B18%5D%5Bdata%5D=col19.label&columns%5B18%5D%5Bname%5D=&columns%5B18%5D%5Bsearchable%5D=true&columns%5B18%5D%5Borderable%5D=false&columns%5B18%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B18%5D%5Bsearch%5D%5Bregex%5D=false&start=0&length=25&search%5Bvalue%5D=&search%5Bregex%5D=false&prev_total=1&q_no=${encodeURI(
        lic
      )}&q_org_label=&q_org_inn=&q_org_ogrn=&dt_from=&dt_to=&q_active=0&q_type=1&q_activity=&q_region=`,
    });
    // const response = HTTP.post(
    //   "https://roszdravnadzor.gov.ru/ajax/services/licenses",
    //   "draw=8&columns%5B0%5D%5Bdata%5D=col1.label&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=col2.label&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=col3.label&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=col4.label&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=false&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=col5.label&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=false&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=col6.label&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=false&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=col7.label&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=false&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=col8.label&columns%5B7%5D%5Bname%5D=&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=false&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5Bdata%5D=col9.label&columns%5B8%5D%5Bname%5D=&columns%5B8%5D%5Bsearchable%5D=true&columns%5B8%5D%5Borderable%5D=false&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B9%5D%5Bdata%5D=col10.label&columns%5B9%5D%5Bname%5D=&columns%5B9%5D%5Bsearchable%5D=true&columns%5B9%5D%5Borderable%5D=false&columns%5B9%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B9%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B10%5D%5Bdata%5D=col11.label&columns%5B10%5D%5Bname%5D=&columns%5B10%5D%5Bsearchable%5D=true&columns%5B10%5D%5Borderable%5D=false&columns%5B10%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B10%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B11%5D%5Bdata%5D=col12.label&columns%5B11%5D%5Bname%5D=&columns%5B11%5D%5Bsearchable%5D=true&columns%5B11%5D%5Borderable%5D=false&columns%5B11%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B11%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B12%5D%5Bdata%5D=col13.label&columns%5B12%5D%5Bname%5D=&columns%5B12%5D%5Bsearchable%5D=true&columns%5B12%5D%5Borderable%5D=false&columns%5B12%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B12%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B13%5D%5Bdata%5D=col14.label&columns%5B13%5D%5Bname%5D=&columns%5B13%5D%5Bsearchable%5D=true&columns%5B13%5D%5Borderable%5D=false&columns%5B13%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B13%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B14%5D%5Bdata%5D=col15.label&columns%5B14%5D%5Bname%5D=&columns%5B14%5D%5Bsearchable%5D=true&columns%5B14%5D%5Borderable%5D=false&columns%5B14%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B14%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B15%5D%5Bdata%5D=col16.label&columns%5B15%5D%5Bname%5D=&columns%5B15%5D%5Bsearchable%5D=true&columns%5B15%5D%5Borderable%5D=false&columns%5B15%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B15%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B16%5D%5Bdata%5D=col17.label&columns%5B16%5D%5Bname%5D=&columns%5B16%5D%5Bsearchable%5D=true&columns%5B16%5D%5Borderable%5D=false&columns%5B16%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B16%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B17%5D%5Bdata%5D=col18.label&columns%5B17%5D%5Bname%5D=&columns%5B17%5D%5Bsearchable%5D=true&columns%5B17%5D%5Borderable%5D=false&columns%5B17%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B17%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B18%5D%5Bdata%5D=col19.label&columns%5B18%5D%5Bname%5D=&columns%5B18%5D%5Bsearchable%5D=true&columns%5B18%5D%5Borderable%5D=false&columns%5B18%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B18%5D%5Bsearch%5D%5Bregex%5D=false&start=0&length=25&search%5Bvalue%5D=&search%5Bregex%5D=false&prev_total=1&q_no=%D0%9B%D0%9E-77-02-011273&q_org_label=&q_org_inn=&q_org_ogrn=&dt_from=&dt_to=&q_active=0&q_type=1&q_activity=&q_region="
    // );
    // console.log({ response });
    // const responseData = JSON.parse(response.content);
    // console.log({ response: response.body });
    let res = await response.json();
    // console.log({ res });
    future.return(res);
    // return response;
    return future.wait();
  },

  async checkAddress(address) {
    let future = new Future();

    const tokenres = await fetch(
      `https://api-maps.yandex.ru/2.1/?lang=ru_RU&amp;apikey=1397126c-7448-409c-9ae1-51ddfd4f8c63`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      }
    );

    // console.log(tokenres);

    let tokenstring = await tokenres.text();
    //

    let matchToken = tokenstring.matchAll(/"token":"(.[^"]*)"/gi);
    matchToken = Array.from(matchToken);
    token = matchToken[0][1];
    console.log({ token });
    // let arr = [];
    // address.forEach(async (item, i) => {
    //   const response = await fetch(
    //     `https://api-maps.yandex.ru/services/search//v2/?callback=id_1627478880276652115015&text=${encodeURI(
    //       item
    //     )}&format=json&rspn=0&lang=ru_RU&token=${token}&type=geo&properties=addressdetails&geocoder_sco=latlong&origin=jsapi2Geocoder&apikey=1397126c-7448-409c-9ae1-51ddfd4f8c63`,
    //     {
    //       method: "GET",
    //       headers: {
    //         Referer: "https://pharm.taxi/",
    //         "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    //       },
    //     }
    //   );
    //   let res = await response.text();
    //   res = await JSON.parse(res.replace("/**/id_1627478880276652115015(", "").replace(");", ""));
    //   // res = res.replace(");", "");
    //   // console.log({ res });
    //
    //   let coords = res && res.data && res.data.features[0].geometry.coordinates;
    //   console.log({ item, coords }, i);
    //   arr.push({ item, coords });
    //   if (address.length == i + 1) {
    //     future.return(arr);
    //   }
    // });

    // let arr = meteorAsyncCall("getByAddress", token, address);
    getByAddress(
      (res) => {
        future.return(res);
      },
      token,
      address
    );

    // const response = await fetch(
    //   `https://api-maps.yandex.ru/services/search//v2/?callback=id_1627478880276652115015&text=${encodeURI(
    //     address
    //   )}&format=json&rspn=0&lang=ru_RU&token=${token}&type=geo&properties=addressdetails&geocoder_sco=latlong&origin=jsapi2Geocoder&apikey=1397126c-7448-409c-9ae1-51ddfd4f8c63`,
    //   {
    //     method: "GET",
    //     headers: {
    //       Referer: "https://pharm.taxi/",
    //       "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    //     },
    //   }
    // );
    // let res = await response.text();
    // res = await JSON.parse(res.replace("/**/id_1627478880276652115015(", "").replace(");", ""));
    // // res = res.replace(");", "");
    // // console.log({ res });
    //
    // let coords = res && res.data && res.data.features[0].geometry.coordinates;

    // console.log({ coords });

    // future.return(arr);
    // return response;
    return future.wait();
  },

  async addLicenseWithPharms({ license, pharms, net }) {
    let fut = new Future();
    if (!Meteor.userId())
      return {
        error: new Meteor.Error(400, "Вы не авторизованы"),
      };
    const user = Meteor.user();
    let authkey = user.services.PharmAuth && user.services.PharmAuth.authkey;
    let userId = user.services.PharmAuth && user.services.PharmAuth.id;
    let data = {
      authkey,

      data: [
        {
          ...license,
          parent_id: net.PharmId,
          userId: userId,
          // license: "string",
          // name: "string",
          // issuing: "string",
          // address: "string",
          // dateStart: "string",
          // dateEnd: "string",
          // ogrn: "string",
          // inn: "string",
          // order: "string",
          // orderFresh: "string",
          pharms: pharms,
          // [
          //   {
          //     // location: {},
          //     name: "string",
          //     activity: "string",
          //     address_fact: "string",
          //     address_fact_street: "string",
          //     address_fact_zip: "string",
          //     appartment_num: "string",
          //     building_num: "string",
          //     city: "string",
          //     code_fias: "string",
          //     district_label: "string",
          //     dt_created: "string",
          //     dt_edited: "string",
          //     ext_city_id: "string",
          //     ext_db: "string",
          //     ext_id: "string",
          //     ext_org: "string",
          //     ext_region_id: "string",
          //     ext_type_id: "string",
          //     fake: "string",
          //     from_b2b: "string",
          //     house_num: "string",
          //     id: "string",
          //     id_create_user: "string",
          //     id_department: "string",
          //     id_licenses_apps_object: "string",
          //     id_organization: "string",
          //     id_revision: "string",
          //     id_type_org: "string",
          //     id_user_edited: "string",
          //     id_voc_city: "string",
          //     id_voc_district: "string",
          //     id_voc_licenser: "string",
          //     id_voc_producer: "string",
          //     id_voc_region: "string",
          //     id_voc_revision_activity_items: "string",
          //     id_voc_revision_object_type: "string",
          //     id_voc_settlements: "string",
          //     ids_voc_revision_activities: "string",
          //     is_active_b2b: "string",
          //     is_actual: "string",
          //     is_foreign: "string",
          //     is_med_business_check: "string",
          //     is_not_code_fias: "string",
          //     is_save_region: "string",
          //     kladr: "string",
          //     label: "string",
          //     label_firm: "string",
          //     label_short: "string",
          //     okato: "string",
          //     oktmo: "string",
          //     region: "string",
          //     street: "string",
          //     address: "string",
          //     addressVCId: 0,
          //     isActive: true,
          //     license: "string",
          //     licenseVCId: 0,
          //     longId: 0,
          //     nameLongId: 0,
          //     parentId: 0,
          //     pharmId: 0,
          //     phone: "string",
          //     phoneVCId: 0,
          //     title: "string",
          //     typeText: "string",
          //     userId: "string",
          //     users: [
          //       {
          //         longId: 0,
          //       },
          //     ],
          //     latitude: 0,
          //     longitude: 0,
          //     mon: {
          //       startTime: 0,
          //       endTime: 0,
          //       breakStart: 0,
          //       breakEnd: 0,
          //     },
          //     tue: {
          //       startTime: 0,
          //       endTime: 0,
          //       breakStart: 0,
          //       breakEnd: 0,
          //     },
          //     wed: {
          //       startTime: 0,
          //       endTime: 0,
          //       breakStart: 0,
          //       breakEnd: 0,
          //     },
          //     thu: {
          //       startTime: 0,
          //       endTime: 0,
          //       breakStart: 0,
          //       breakEnd: 0,
          //     },
          //     fri: {
          //       startTime: 0,
          //       endTime: 0,
          //       breakStart: 0,
          //       breakEnd: 0,
          //     },
          //     sat: {
          //       startTime: 0,
          //       endTime: 0,
          //       breakStart: 0,
          //       breakEnd: 0,
          //     },
          //     sun: {
          //       startTime: 0,
          //       endTime: 0,
          //       breakStart: 0,
          //       breakEnd: 0,
          //     },
          //   },
          // ],
        },
      ],
    };
    // console.log(JSON.stringify(data));

    const response = await fetch(`${API_SERVER}/CreateDrugstoreWLKList_Test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => {
      return response.json();
    });
    return response;
  },

  getNetLicenses(id) {
    // let res = pharms.update({ License: "ЛО-47-02-001594" }, { $set: { ParentId: 394759 } });
    // console.log({ res });
    // console.log({ id });
    let licList = lics
      .find(
        { parent_id: id }
        // { fields: { _id: 1, parent_id: 1, license: 1, name: 1, "pharms.length": 1 } }
      )
      .fetch();
    console.log({ licList });
    licList.forEach((item, i) => {
      item.pharms = item.pharms.length;
      item._id = item._id.valueOf();
    });
    console.log({ licList });
    return licList;
  },

  getLicensepharms(id) {
    let licList = pharms
      .find(
        { License: id }
        // { fields: { _id: 1, parent_id: 1, license: 1, name: 1, "pharms.length": 1 } }
      )
      .fetch();
    // licList.forEach((item, i) => {
    //   item.pharms = item.pharms.length;
    //   item._id = item._id.valueOf();
    // });
    return licList;
  },

  getPharmsByNet(id) {
    let pharmsList = pharms
      .find(
        { ParentId: parseInt(id) }
        // { fields: { _id: 1, parent_id: 1, license: 1, name: 1, "pharms.length": 1 } }
      )
      .fetch();
    // licList.forEach((item, i) => {
    //   item.pharms = item.pharms.length;
    //   item._id = item._id.valueOf();
    // });
    return pharmsList;
  },

  async createInvite({ email, pharmId, firstname, lastname, patronymic }) {
    if (!Meteor.userId())
      return {
        error: new Meteor.Error(400, "Вы не авторизованы"),
      };
    const user = Meteor.user();
    let authkey = user.services.PharmAuth && user.services.PharmAuth.authkey;
    console.log({
      email,
      roleCode: pharmId,
      firstname,
      lastname,
      middlename: patronymic,
      authkey,
    });

    const response = await fetch(`${API_SERVER}/Invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        roleCode: pharmId,
        firstname,
        lastname,
        middlename: patronymic,
        authkey,
      }),
    }).then((response) => {
      return response.json();
    });
    return response;
    // console.log(recipes);
  },

  async confirmInvite({ email, code, service, password, firstname, lastname, patronymic }) {
    // if (!Meteor.userId())
    //   return {
    //     error: new Meteor.Error(400, "Вы не авторизованы"),
    //   };
    // const user = Meteor.user();
    // let authkey = user.services.PharmAuth && user.services.PharmAuth.authkey;
    console.log({
      code,
      email,
      service: "6",
      newPassword: password,
      firstname,
      lastname,
      middlename: patronymic,
    });
    // {
    //   "email": "string",
    //   "code": "string",
    //   "service": "string",
    //   "parentId": "string",
    //   "newPassword": "string",
    //   "firstname": "string",
    //   "lastname": "string",
    //   "middlename": "string"
    // }

    const response = await fetch(`${API_SERVER}/RegistrationConfirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        email,
        service: "6",
        newPassword: password,
        firstname,
        lastname,
        middlename: patronymic,
      }),
    }).then((response) => {
      return response.json();
    });
    return response;
    // console.log(recipes);
  },

  async changeAssortiment(drug) {
    if (!Meteor.userId())
      return {
        error: new Meteor.Error(400, "Вы не авторизованы"),
      };
    const user = Meteor.user();
    let authkey = user.services.PharmAuth && user.services.PharmAuth.authkey;
    // console.log({
    //   invitedEmail:email,
    //   invitedRoleCodes:[pharmId],
    //   authkey,
    // });
    console.log(
      JSON.stringify({
        authkey,
        lass: [
          {
            pharmId: drug.pharm_id,
            fp_id: drug.fp_id,
            qty: parseInt(drug.qty),
            qty_free: parseInt(drug.qty_free),
            price: parseFloat(drug.price),
            pharm_pack_id: drug.pharm_pack_id,
          },
        ],
      })
    );
    const response = await fetch(`${API_SERVER}/ChangeAssortiment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authkey,
        lass: [
          {
            pharmId: drug.pharm_id,
            fp_id: drug.fp_id,
            qty: parseInt(drug.qty),
            qty_free: parseInt(drug.qty_free),
            price: parseFloat(drug.price),
            pharm_pack_id: drug.pharm_pack_id,
          },
        ],
      }),
    }).then((response) => {
      return response.json();
    });
    return response;
    // console.log(recipes);
  },

  async assortimentCount() {
    const user = Meteor.user();
    if (!user || !user.services.PharmAuth.id) return 0;
    if (user.services.PharmAuth.role == "Admin") {
      const netsReq = pharmNets
        .find({ UserId: user.services.PharmAuth.id.toString() }, { fields: { PharmId: 1 } })
        .fetch();
      // console.log({ UserId: user.services.PharmAuth.id.toString() });
      // console.log({ netsReq });
      let nets = [];
      netsReq.forEach((item, i) => {
        nets.push(item.PharmId);
      });
      // console.log({ $in: nets });
      const pharmsReq = pharms.find({ ParentId: { $in: nets } }, { fields: { PharmId: 1 } });
      let pharmsList = [];
      pharmsReq.forEach((item, i) => {
        pharmsList.push(item.PharmId);
      });
      // console.log({ $in: pharmsList });

      // console.log(assortiment.find({ pharm_id: { $in: pharmsList } }, { limit: 500 }).fetch());
      return assortiment.find({ pharm_id: { $in: pharmsList } }).count();
    } else {
      return assortiment.find({ pharm_id: { $in: user.pharms } }).count();
    }
  },
});
