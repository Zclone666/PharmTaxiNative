import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";

import { ReactiveAggregate } from "meteor/tunguska:reactive-aggregate";
import { Dosages } from "../../both/collections";
import { dosages } from "../connections/ecp";

Meteor.startup(() => {
  Meteor.publish("dosages", function (ids) {
    check(ids, Array);
    ReactiveAggregate(
      this,
      dosages,
      [
        {
          idenc: {$in: [...ids]}
        },
      ],
      {
        clientCollection: "Dosages",
        debounceDelay: 100,
      }
    );
  })
