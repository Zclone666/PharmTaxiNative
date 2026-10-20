import { Meteor } from "meteor/meteor";
import { orders, fake_orders, pharms, pharmNets } from "../../both/collections";
import { ReactiveAggregate } from "meteor/tunguska:reactive-aggregate";
import { FindFromPublication } from "meteor/percolate:find-from-publication";

Meteor.startup(() => {
  Meteor.publish("orders", function () {
    const user = Meteor.user();
    // console.log({ user });
    if (!user) return;
    // if (user) {
    return orders.find({ user_id: user.services.AppGuestAuth.id.toString() });
    // }
  });
  Meteor.publish("ordersWithPharms", function () {
    const user = Meteor.user();
    // console.log({ user });
    if (!user) return;

    const user_id =
      (user.services.AppGuestAuth && user.services.AppGuestAuth.id.toString()) ||
      (user.services.AppAuth && user.services.AppAuth.id.toString());
    ReactiveAggregate(
      this,
      orders,
      [
        {
          $match: {
            user_id,
          },
        },
        {
          $lookup: {
            from: "pharms",
            localField: "pharm_id",
            foreignField: "PharmId",
            as: "pharm",
          },
        },
        {
          $project: {
            _id: 1,
            pharm_id: 1,
            user_id: 1,
            order_id: 1,
            recipe: 1,
            drugs: 1,
            isActive: 1,
            CreationDate: 1,
            IssueDate: 1,
            DeliveryAddress: 1,
            status: 1,
            Delivery: 1,
            pharm: { $first: "$pharm" },
          },
        },
      ],
      {
        clientCollection: "OrdersWithPharms",
        debounceDelay: 100,
      }
    );
  });
  Meteor.publish("fakesWithPharms", function () {
    const user = Meteor.user();
    // console.log({ user });
    if (!user) return;

    const user_id =
      (user.services.AppGuestAuth && user.services.AppGuestAuth.id.toString()) ||
      (user.services.AppAuth && user.services.AppAuth.id.toString());
    ReactiveAggregate(
      this,
      fake_orders,
      [
        {
          $match: {
            user_id,
          },
        },
        {
          $lookup: {
            from: "pharms",
            localField: "pharm_id",
            foreignField: "PharmId",
            as: "pharm",
          },
        },
        {
          $project: {
            _id: 1,
            pharm_id: 1,
            user_id: 1,
            order_id: 1,
            recipe: 1,
            items: 1,
            isActive: 1,
            CreationDate: 1,
            IssueDate: 1,
            DeliveryAddress: 1,
            status: 1,
            Delivery: 1,
            pharm: { $first: "$pharm" },
          },
        },
      ],
      {
        clientCollection: "FakesWithPharms",
        debounceDelay: 100,
      }
    );
  });
  FindFromPublication.publish("pharmOrders", function (skip = 0, limit = 100000) {
    const user = Meteor.user();
    if (!user || !user.services || !user.services.PharmAuth || !user.services.PharmAuth.id) return [];
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
      return orders.find({ pharm_id: { $in: pharmsList } }, { skip, limit });
    } else if (user.services.PharmAuth.role == "Provisor") {
      return orders.find({ pharm_id: { $in: user.pharms } });
    }
  });
});
