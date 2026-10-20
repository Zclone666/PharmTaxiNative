import { Mongo } from "meteor/mongo";
//import db from "../server/connections"
// let recipe_db = new MongoInternals.RemoteCollectionDriver("mongodb://mongoAdmin:hRUxcJFG@91.239.27.158:27017/ECP_Recipes?authSource=admin");
// MyCollection = new Mongo.Collection("collection_name", { _driver: database });

export const users = Meteor.users;
export const pharms = new Mongo.Collection("pharms");
export const pharmsFD = new Mongo.Collection("pharmsFD");
export const pharmNets = new Mongo.Collection("pharmNets");
export const lics = new Mongo.Collection("lics");
export const OrdersWithPharms = new Mongo.Collection("OrdersWithPharms");
export const assortiment = new Mongo.Collection("assortiment");
export const assortiment_small = new Mongo.Collection("assortiment_small");
export const orders = new Mongo.Collection("orders");
export const fake_orders = new Mongo.Collection("fake_orders");
export const concepts_cache = new Mongo.Collection("concepts_cache");
export const AvailableInRadius = new Mongo.Collection("AvailableInRadius");
export const AvailableDrug = new Mongo.Collection("AvailableDrug");
export const PharmsInRadius = new Mongo.Collection("PharmsInRadius");
export const MedChest = new Mongo.Collection("MedChest");

export const Dosages = new Mongo.Collection("Dosages");
// export const myFile = new FS.Collection("myFile", {
//   stores: [new FS.Store.FileSystem("myFile", { path: "../../../../../public/files" })],
// });
// myFile.allow({
//   download: function (userId, fileObj) {
//     return true;
//   },
// });
