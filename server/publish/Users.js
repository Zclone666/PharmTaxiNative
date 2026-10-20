import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";

import { ReactiveAggregate } from "meteor/tunguska:reactive-aggregate";
import { Dosages } from "../../both/collections";
// import { dosages } from "../connections/ecp";

Meteor.startup(() => {
  Meteor.publish("MyUsers", function () {
    const user = Meteor.user();
    if (
      !user ||
      !user.services ||
      !user.services.PharmAuth ||
      !user.services.PharmAuth.id ||
      user.services.PharmAuth.role != "Admin"
    )
      return [];
    // console.log("HERE");
    // let arr = Meteor.users.find({ inviter_id: parseInt(user.services.PharmAuth.id) }).fetch();
    // console.log(arr);
    return Meteor.users.find({ inviter_id: parseInt(user.services.PharmAuth.id) });
  });
});
