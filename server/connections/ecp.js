import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
var database = new MongoInternals.RemoteCollectionDriver(
  "mongodb://pharmtaxi:meteor@mongodb.socmedica.com:27027/ECP?authSource=admin&directConnection=false"
);
//export const db = new MongoInternals.RemoteCollectionDriver(
//  "mongodb://pharmtaxi:meteor@mongodb.socmedica.com:27027/PHTForSLF?authSource=admin&readPreference=secondaryPreferred&directConnection=false&ssl=false"
//);
export const dosages = new Mongo.Collection("DosageCache", { _driver: database });
