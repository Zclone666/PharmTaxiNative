import { Meteor } from "meteor/meteor";
import { FindFromPublication } from "meteor/percolate:find-from-publication";
import { assortiment, pharmNets, pharms } from "../../both/collections";
Meteor.startup(() => {
  FindFromPublication.publish("assortiment", function (skip = 0, limit = 100000) {
    const user = Meteor.user();
    if (!user || !user.services || !user.services.PharmAuth || !user.services.PharmAuth.id) return [];
    if (user.services.PharmAuth.role == "Admin") {
      const netsReq = pharmNets
        .find({ UserId: user.services.PharmAuth.id.toString() }, { fields: { PharmId: 1 } })
        .fetch();
      // console.log({ UserId: user.services.PharmAuth.id.toString() });
      console.log({ netsReq });
      let nets = [];
      netsReq.forEach((item, i) => {
        nets.push(item.PharmId);
      });
      console.log({ $in: nets });
      const pharmsReq = pharms.find({ ParentId: { $in: nets } }, { fields: { PharmId: 1 } });
      let pharmsList = [];
      pharmsReq.forEach((item, i) => {
        pharmsList.push(item.PharmId);
      });
      console.log({ $in: pharmsList });

      // console.log(assortiment.find({ pharm_id: { $in: pharmsList } }, { limit: 500 }).fetch());
      return assortiment.find({ pharm_id: { $in: pharmsList } }, { skip, limit });
    } else if (user.services.PharmAuth.role == "Provisor") {
      return assortiment.find({ pharm_id: { $in: user.pharms } }, { skip, limit });
    }
  });
});
