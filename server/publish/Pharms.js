import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { pharms, assortiment, pharmsFD, assortiment_small, pharmNets } from "../../both/collections";
import { ReactiveAggregate } from "meteor/tunguska:reactive-aggregate";
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

let x = {
  // db.pharms.aggregate([
  //      {
  //       $geoNear: {
  //          near: { type: "Point", coordinates: [ 37.6156, 55.7522 ] },
  //          spherical: true,
  //          maxDistance: 4000,
  //         //  query: { PharmId: { $in: [3122, 336] } },
  //          distanceField: "calcDistance"
  //       }
  //     },
  //     {
  //       $unwind: {
  //           path: "$pharm_packs",
  //           preserveNullAndEmptyArrays: true
  //       }
  //     },
  //     {$lookup:
  //         {
  //             from: "assortiment",
  //             localField: "PharmId",
  //             foreignField: "PharmId",
  //             as: "pharm_packs"
  //         }
  //     },
  //     {
  //         $unwind: {
  //             path: "$pharm_packs",
  //             preserveNullAndEmptyArrays: true
  //         }
  //     },
  //     {
  //         $match: {
  //             "pharm_packs.PharmPackId": { $in: ["40010281", '600002213']}
  //         },
  //
  //     },
  //     {
  //       $group: {
  //         _id: '$_id',
  //         address : { $first: "$Address" },
  //         name: { $first: "$Title"},
  //         phone : { $first: "$Phone" },
  //         packs : { $push: {
  //             name: "$pharm_packs.TradeName",
  //             manufacturer: "$pharm_packs.Manufacturer" ,
  //             price: "$pharm_packs.SellingPrice" ,
  //             fp_id: "$pharm_packs.PharmPackId"
  //         } },
  //         latitude : { $first: "$latitude" },
  //         longitude : { $first: "$longitude" },
  //         packsCount:  { $sum: 1}
  //       }
  //     },
  //
  //    ])
  // [
  //      {
  //       $geoNear: {
  //          near: { type: "Point", coordinates: [ 37.6156, 55.7522 ] },
  //          spherical: true,
  //          maxDistance: 15000,
  //         // query: { PharmId: { $in: [3122, 336] } },
  //          distanceField: "calcDistance"
  //       }
  //    },
  //    {
  //       $lookup:
  //          {
  //            from: "assortiment",
  //            let: { pharm_id: "$PharmId" },
  //            pipeline: [
  //               { $match:
  //                  { $expr:
  //                     { $and:
  //                        [
  //                          { $in: [ "$PharmPackId",  ["40010281", '600002213'] ] },
  //                          { $eq: [ "$PharmId", "$$pharm_id" ] },
  //                        ]
  //                     }
  //                  }
  //               },
  //               { $project: { PharmPackId: 0, _id: 0 } },
  //               { $count: 'pharmsCount' },
  //            ],
  //            as: "pharmsFound"
  //          }
  //    },
  //
  //    ]
};

// Meteor.publish("availableInRadius", function (longitudeMin, longitudeMax, latitudeMin, latitudeMax, drugs) {
//   // const user = Meteor.user();
//   // if (user) {
//   //[37.6156, 55.7522]
//   //"40010281", "600002213"
//   const user = Meteor.user();
//
//   check(longitudeMin, Number);
//   check(longitudeMax, Number);
//   check(latitudeMin, Number);
//   check(latitudeMax, Number);
//   // if (user) {
//   //[37.6156, 55.7522]
//   //"40010281", "600002213"
//   // check(longitude, Number);
//   // check(latitude, Number);
//   check(drugs, Array);
//   // check(distance, Match.Maybe(Number));
//   // if (!distance) distance = 3000;
//
//   const rules = {
//     allInList: false,
//     analogs: true,
//   };
//
//   let matches = {};
//   if (rules.allInList) {
//     matches.$and = [];
//   } else {
//     matches.$or = [];
//   }
//
//   // let s = {
//   //   $and: [
//   //     {
//   //       "pharm_packs.form_id": "+qbdqiTg3nODLu1K4yKQDQ==",
//   //       "pharm_packs.dv_id": "6HcfXghaGmW5Vnw34YcKPA==",
//   //       "pharm_packs.fp_id": "fd9Em44I8Pf2KA1q+auEOQ==",
//   //     },
//   //   ],
//   // };
//
//   drugs.forEach((drug, i) => {
//     let { fp_id, tn_id, dv_id, method_id, form_id, dosage_id, dosage_value } = drug;
//     let matchItem = {};
//     if (method_id) matchItem["pharm_packs.method_id"] = method_id;
//     if (form_id) matchItem["pharm_packs.form_id"] = form_id;
//     if (dosage_id) matchItem["pharm_packs.dosage_id"] = dosage_id;
//     if (dosage_value) matchItem["pharm_packs.dosage_value"] = dosage_value;
//     if (rules.analogs) {
//       matchItem.$or = [];
//
//       if (dv_id) matchItem.$or.push({ "pharm_packs.dv_id": dv_id });
//       if (tn_id) matchItem.$or.push({ "pharm_packs.tn_id": tn_id });
//       if (fp_id) matchItem.$or.push({ "pharm_packs.fp_id": fp_id });
//     } else {
//       if (tn_id) matchItem["pharm_packs.tn_id"] = tn_id;
//       if (dv_id) matchItem["pharm_packs.dv_id"] = dv_id;
//       if (fp_id) matchItem["pharm_packs.fp_id"] = fp_id;
//     }
//     if (rules.allInList) {
//       matches.$and.push(matchItem);
//     } else {
//       matches.$or.push(matchItem);
//     }
//   });
//
//   // console.log(matches);
//
//   ReactiveAggregate(
//     this,
//     pharmsFD,
//     [
//       // {
//       //   $geoNear: {
//       //     near: {
//       //       type: "Point",
//       //       coordinates: [longitude, latitude],
//       //     },
//       //     spherical: true,
//       //     maxDistance: distance,
//       //     includeLocs: "location",
//       //     // query: { isActive: { $eq: true } },
//       //     distanceField: "calcDistance",
//       //   },
//       // },
//       {
//         $match: {
//           location: {
//             $geoWithin: {
//               $box: [
//                 [longitudeMin, latitudeMin],
//                 [longitudeMax, latitudeMax],
//               ],
//             },
//           },
//         },
//       },
//       {
//         $unwind: {
//           path: "$pharm_packs",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       lookUps.assortimentForPharm,
//       {
//         $unwind: {
//           path: "$pharm_packs",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $match: matches,
//       },
//       {
//         $group: {
//           _id: { $toString: "$PharmId" },
//           distance: { $first: "$calcDistance" },
//           location: { $first: "$location" },
//           packs: {
//             $push: {
//               price: "$pharm_packs.price",
//               fp_id: "$pharm_packs.fp_id",
//               dv_id: "$pharm_packs.dv_id",
//               tn_id: "$pharm_packs.tn_id",
//               available: "$pharm_packs.qty_free",
//             },
//           },
//           isActive: { $first: "$IsActive" },
//
//           packsCount: { $sum: 1 },
//         },
//       },
//       {
//         $addFields: {
//           longitude: { $arrayElemAt: ["$location", 0] },
//           latitude: { $arrayElemAt: ["$location", -1] },
//         },
//       },
//     ],
//     {
//       clientCollection: "AvailableInRadius",
//       debounceDelay: 100,
//     }
//   );
//
//   // return pharms.find(
//   //   {
//   //     location: {
//   //       $near: {
//   //         $geometry: { type: "Point", coordinates: [37.6156, 55.7522] },
//   //         $minDistance: 0,
//   //         $maxDistance: 3000,
//   //       },
//   //     },
//   //   },
//   //   { limit: 200 }
//   // );
//   // }
// });

// Meteor.publish("availableInAll", function (drugs) {
//   // const user = Meteor.user();
//   // if (user) {
//   //[37.6156, 55.7522]
//   //"40010281", "600002213"
//   const user = Meteor.user();
//   check(drugs, Array);
//   // check(distance, Match.Maybe(Number));
//   // if (!distance) distance = 3000;
//
//   const rules = {
//     allInList: false,
//     analogs: true,
//   };
//
//   let matches = {};
//   if (rules.allInList) {
//     matches.$and = [];
//   } else {
//     matches.$or = [];
//   }
//
//   drugs.forEach((drug, i) => {
//     let { fp_id, tn_id, dv_id, method_id, form_id, dosage_id, dosage_value } = drug;
//     let matchItem = {};
//     if (method_id) matchItem["method_id"] = method_id;
//     if (form_id) matchItem["form_id"] = form_id;
//     if (dosage_id) matchItem["dosage_id"] = dosage_id;
//     if (dosage_value) matchItem["dosage_value"] = dosage_value;
//     if (rules.analogs) {
//       if (!dv_id && tn_id) {
//         let drugFull = assortiment_small.findOne({ tn_id });
//         dv_id = drugFull.dv_id;
//       }
//       matchItem.$or = [];
//
//       if (dv_id) matchItem.$or.push({ dv_id: dv_id });
//       if (tn_id) matchItem.$or.push({ tn_id: tn_id });
//       if (fp_id) matchItem.$or.push({ fp_id: fp_id });
//     } else {
//       if (tn_id) matchItem["tn_id"] = tn_id;
//       if (dv_id) matchItem["dv_id"] = dv_id;
//       if (fp_id) matchItem["fp_id"] = fp_id;
//     }
//     if (rules.allInList) {
//       matches.$and.push(matchItem);
//     } else {
//       matches.$or.push(matchItem);
//     }
//   });
//
//   // console.log(matches.$or[0]);
//
//   ReactiveAggregate(
//     this,
//     assortiment_small,
//     [
//       // {
//       //   $geoNear: {
//       //     near: {
//       //       type: "Point",
//       //       coordinates: [longitude, latitude],
//       //     },
//       //     spherical: true,
//       //     maxDistance: distance,
//       //     includeLocs: "location",
//       //     // query: { isActive: { $eq: true } },
//       //     distanceField: "calcDistance",
//       //   },
//       // },
//       {
//         $match: matches,
//       },
//       {
//         $group: {
//           _id: { $toString: "$pharm_id" },
//           packs: {
//             $push: {
//               price: "$price",
//               fp_id: "$fp_id",
//               dv_id: "$dv_id",
//               tn_id: "$tn_id",
//               available: "$qty_free",
//             },
//           },
//           packsCount: { $sum: 1 },
//         },
//       },
//     ],
//     {
//       clientCollection: "AvailableInAll",
//       debounceDelay: 100,
//     }
//   );
//
//   // return pharms.find(
//   //   {
//   //     location: {
//   //       $near: {
//   //         $geometry: { type: "Point", coordinates: [37.6156, 55.7522] },
//   //         $minDistance: 0,
//   //         $maxDistance: 3000,
//   //       },
//   //     },
//   //   },
//   //   { limit: 200 }
//   // );
//   // }
// });

Meteor.publish("availableDrug", function (drug) {
  // const user = Meteor.user();
  // check(drug, Object);

  if (!Meteor.user()) return [];
  const { distance, analogs, fullList, partners } = Meteor.user();

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

  matches = matchItem;

  matches.qty_free = { $gt: 0 };

  // console.log(matches);

  return assortiment_small.find(matches);
  // ReactiveAggregate(
  //   this,
  //   assortiment_small,
  //   [
  //     {
  //       $match: matches,
  //     },
  //     {
  //       $group: {
  //         _id: { $toString: "$pharm_id" },
  //
  //         packs: {
  //           $push: {
  //             price: { $toString: "$price" },
  //             fp_id: "$fp_id",
  //             dv_id: "$dv_id",
  //             tn_id: "$tn_id",
  //             available: "$qty_free",
  //           },
  //         },
  //         packsCount: { $sum: 1 },
  //       },
  //     },
  //   ],
  //   {
  //     clientCollection: "AvailableDrug",
  //     debounceDelay: 100,
  //   }
  // );
});

Meteor.publish("myPharmNets", function () {
  // const user = Meteor.user();
  // check(drug, Object);
  let user = Meteor.user();
  if (!user || !user.services || !user.services.PharmAuth || !user.services.PharmAuth.id) return [];

  return pharmNets.find({ UserId: user.services.PharmAuth.id.toString() });
});

Meteor.publish("myPharms", function () {
  // const user = Meteor.user();
  // check(drug, Object);
  let user = Meteor.user();
  if (!user || !user.services || !user.services.PharmAuth || !user.services.PharmAuth.id) return [];

  if (user.services.PharmAuth.role == "Admin") {
    let nets = pharmNets.find({ UserId: user.services.PharmAuth.id.toString() }, { fields: { PharmId: 1 } }).fetch();
    // console.log({nets});
    nets.forEach((item, i) => {
      nets[i] = item.PharmId;
    });
    console.log({ nets });

    // return pharms.find({ UserId: user.services.PharmAuth.id.toString() });
    return pharms.find({ $or: [{ ParentId: { $in: nets } }, { UserId: user.services.PharmAuth.id.toString() }] });
  } else if (user.services.PharmAuth.role == "Provisor") {
    return pharms.find({ PharmId: { $in: user.pharms } });
  }
});

// Meteor.publish("pharmsInRadius", function (longitudeMin, longitudeMax, latitudeMin, latitudeMax) {
//   // const user = Meteor.user();
//   // if (user) {
//   //[37.6156, 55.7522]
//   //"40010281", "600002213"
//   check(longitudeMin, Number);
//   check(longitudeMax, Number);
//   check(latitudeMin, Number);
//   check(latitudeMax, Number);
//
//   // check(distance, Match.Maybe(Number));
//   // if (!distance) distance = 3000;
//
//   ReactiveAggregate(
//     this,
//     pharms,
//     [
//       {
//         $match: {
//           location: {
//             $geoWithin: {
//               $box: [
//                 [longitudeMin, latitudeMin],
//                 [longitudeMax, latitudeMax],
//               ],
//             },
//           },
//         },
//       },
//
//       {
//         $group: {
//           _id: { $toString: "$PharmId" },
//           address: { $first: "$Address" },
//           name: { $first: "$Title" },
//           phone: { $first: "$Phone" },
//           distance: { $first: "$calcDistance" },
//           latitude: { $first: "$latitude" },
//           longitude: { $first: "$longitude" },
//         },
//       },
//     ],
//     {
//       clientCollection: "PharmsInRadius",
//       debounceDelay: 100,
//     }
//   );
// });
