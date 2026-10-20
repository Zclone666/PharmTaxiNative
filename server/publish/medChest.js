import { Meteor } from "meteor/meteor";
import { MedChest } from "../../both/collections";
Meteor.startup(() => {
  Meteor.publish("MedChest", function () {
    // const user = Meteor.user();
    // if (user) {
    return MedChest.find();
    // }
  });
});
