import { Meteor } from "meteor/meteor";
// import { LinksCollection } from "/imports/api/links";
import { Accounts } from "meteor/accounts-base";
import Future from "fibers/future";
import { HTTP } from "meteor/http";
import "./methods";
import "./publish";

import SERVER from "../both/constants";
// const SERVER_TYPE = process.env.SERVER_TYPE;
const { api } = Meteor.settings;
export const API_SERVER = {
  prod: "https://service.socmedica.com:9025",
  dev: "https://service.socmedica.com:9025",
  local: "https://service.socmedica.com:9025",
}[api || SERVER];
// console.log({ api: process.env }); //, env: process.env, SERVER_TYPE, API_SERVER });
// function insertLink({ title, url }) {
//   LinksCollection.insert({ title, url, createdAt: new Date() });
// }

// ЭКФ Web (проверка листа назначения) - 4
// ЭКФ Desktop - 1
// ЭКФ IntegrationMIS - 2
// ЭКФ LocalServer - 3
// Статистика ЭКФ - 43
// ЭКФ Web (технический API) - 108
// ABC/VEN/DDD - 19
// ФАРМТАКСИ для Пациента - 5
// ФАРМТАКСИ для Аптек - 6
// ФАРМТАКСИ для Аптечной сети - 7
// СКОЛ - 47
// Генпаспорт - 49
// ГИППОКРАТ - 17
// Мониторинг - 122

import { MedChest, assortiment } from "../both/collections";

Meteor.startup(() => {
  Accounts.config({ loginExpirationInDays: null });
  // Accounts.registerLoginHandler("SocmedicaAuth", (options) => {
  //   console.log("custom login handler, options: ", options);
  //
  //   const response = HTTP.post("https://cs.socmedica.com/api/user/authorization", {
  //     data: options.data,
  //   });
  //
  //   const data = response.data;
  //
  //   console.log("response data: ", data);
  //
  //   if (data.alert.code != 200)
  //     return {
  //       error: new Meteor.Error(400, data.alert.message, data),
  //     };
  //
  //   if (data.alert.code == 200) {
  //     return Accounts.updateOrCreateUserFromExternalService(
  //       "SocmedicaAuth",
  //       {
  //         id: {
  //           email: options.data.email,
  //         },
  //         authkey: data.authkey,
  //       },
  //       {
  //         profile: {
  //           rand: Math.random(),
  //         },
  //       }
  //     );
  //   }
  //
  //   return undefined;
  // });

  // @observable distance = 10;
  // @observable analogs = false;
  // @observable fullList = false;
  // @observable partners = false;
  Accounts.onCreateUser((options, user) => {
    const customizedUser = Object.assign(
      {
        isGuest: true,
        distance: 10,
        analogs: true,
        fullList: false,
        partners: false,
        role: "patient",
      },
      user
    );

    // We still want the default hook's 'profile' behavior.

    // if (options.profile) {
    //   let nameArr = options.profile.name && options.profile.name.split(" ");
    //   nameArr = nameArr.slice(0, 2);
    //   nameArr.forEach((item, i) => {
    //     nameArr[i] = encodeURIComponent(item);
    //   });
    //   if (nameArr.length < 2) nameArr.push(nameArr[0]);
    //
    //   // console.log(`https://v2.namsor.com/NamSorAPIv2/api2/json/gender/${nameArr.join('/')}`);
    //   customizedUser.profile = options.profile;
    // }

    return customizedUser;
  });
  Accounts.registerLoginHandler("AppGuestAuth", (options) => {
    console.log("custom login handler, options: ", options);

    var future = new Future();

    let { authType } = options;
    let myuser = Meteor.user();
    let meta = {
      services: [],
      role: null,
    };

    let auth = {
      id: (options.userid && options.userid.toString()) || null,
      authkey: options.authkey || null,
      role: "Guest",
    };

    let login = {
      email: (options.auth && options.auth.email) || null,
      password: (options.auth && options.auth.password) || null,
    };

    let authTypes = ["pharm_master", "pharm_slave", "app", "app_guest"];

    let user = undefined;

    if (authType == "app_guest") {
      if (auth.authkey) {
        console.log("GUEST AUTHKEY");
        user = Accounts.updateOrCreateUserFromExternalService("AppGuestAuth", auth, {
          profile: {},
        });
        // console.log({ user });
        future["return"](user);
      } else {
        console.log("GUEST NEW");
        Meteor.call("newGuest", (error, result) => {
          console.log({ result });
          if (result) {
            user = Accounts.updateOrCreateUserFromExternalService(
              "AppGuestAuth",
              { id: result.userid.toString(), authkey: result.authkey, role: "Guest" },
              {
                profile: {},
              }
            );
            future["return"](user);
          } else {
            future["return"](user);
          }
        });
      }
    } else if (authType == "app") {
      if (auth.authkey) {
        console.log("APP AUTHKEY");
        user = Accounts.updateOrCreateUserFromExternalService("AppAuth", auth, {
          profile: {},
        });
        // console.log({ user });
        future["return"](user);
      } else if (login.email && login.password) {
        console.log("APP LOGIN");
        Meteor.call("authorize", login.email, login.password, "5", (error, result) => {
          console.log({ error, result });
          if (result && result.alert && result.alert.code == "200") {
            Meteor.users.update(
              { _id: Meteor.userId() },
              {
                $set: {
                  "services.AppAuth": {
                    id: result.userid.toString(),
                    authkey: result.authkey,
                    role: result.role,
                  },
                  isGuest: false,
                  "patient.email": login.email,
                },
                $unset: {
                  "services.AppGuestAuth": "",
                },
              },
              () => {
                user = Accounts.updateOrCreateUserFromExternalService(
                  "AppAuth",
                  {
                    id: result.userid.toString(),
                    authkey: result.authkey,
                    role: result.role,
                  },
                  {
                    profile: {},
                  }
                );
                future["return"](user);
              }
            );
          } else {
            future["return"]({
              error: new Meteor.Error(
                result.code || result.alert.code,
                result.message || result.alert.message,
                result.alert || result
              ),
            });
          }
        });
      } else {
        future["return"](user);
      }
    } else if (authType == "pharm") {
      if (auth.authkey) {
        console.log("PHARM MASTER AUTHKEY");
        user = Accounts.updateOrCreateUserFromExternalService("PharmAuth", auth, {
          profile: {},
        });
        // console.log({ user });
        future["return"](user);
      } else if (login.email && login.password) {
        console.log("PHARM MASTER LOGIN");
        Meteor.call("authorize", login.email, login.password, null, (error, result) => {
          console.log({ result, error });
          if (result && result.authkey) {
            let ifUser = Meteor.users.findOne({ email: login.email });
            console.log({ ifUser });
            console.log("here 0");
            if (ifUser && ifUser._id && (!ifUser.services || !ifUser.services.PharmAuth)) {
              console.log("here 1", ifUser);
              Meteor.users.update(
                { _id: ifUser._id },
                {
                  $set: {
                    services: {
                      PharmAuth: {
                        id: result.userid.toString(),
                        authkey: result.authkey,
                        role: result.role,
                      },
                    },
                  },
                },
                () => {
                  console.log("here 2");
                  user = Accounts.updateOrCreateUserFromExternalService(
                    "PharmAuth",
                    {
                      id: result.userid.toString(),
                      authkey: result.authkey,
                      role: result.role,
                    },
                    {
                      profile: {},
                    }
                  );
                  console.log({ user });
                  console.log("here 3");
                  future["return"](user);
                }
              );
            } else {
              console.log("here 4");
              user = Accounts.updateOrCreateUserFromExternalService(
                "PharmAuth",
                {
                  id: result.userid.toString(),
                  authkey: result.authkey,
                  role: result.role,
                },
                {
                  profile: {},
                }
              );
              console.log("here 5");
              console.log({ user });
              future["return"](user);
            }
          } else {
            console.log("here 6");
            console.log(result);
            future["return"]({
              error: new Meteor.Error(
                result.code || result.alert.code,
                result.message || result.alert.message,
                result.alert || result
              ),
            });
          }
        });
      } else {
        future["return"](user);
      }
    } else if (authType == "pharm_slave") {
      if (auth.authkey) {
        console.log("PHARM AUTHKEY");
        user = Accounts.updateOrCreateUserFromExternalService("PharmAuth", auth, {
          profile: {},
        });
        // console.log({ user });
        // console.log({ user });
        future["return"](user);
      } else if (login.email && login.password) {
        console.log("PHARM LOGIN");
        Meteor.call("authorize", login.email, login.password, "6", (error, result) => {
          if (result) {
            // console.log({ result });
            user = Accounts.updateOrCreateUserFromExternalService(
              "PharmAuth",
              {
                id: result.userid,
                authkey: result.authkey,
              },
              {
                profile: {},
              }
            );
            console.log({ user });
            future["return"](user);
          } else {
            future["return"](user);
          }
        });
      } else {
        future["return"](user);
      }
    }

    return future.wait();
    // if (options.auth && options.auth.email && options.auth.password) {
    //   console.log("Login PASS");
    //   let data = {
    //     service: "5",
    //     ...options.auth,
    //   };
    //   const response = HTTP.post("https://service.socmedica.dev:9025/Authorize", {
    //     data,
    //   });
    //   const respdata = JSON.parse(response.content);
    //   // console.log(respdata);
    //   // console.log(data.userid, data.authkey, data.alert.code == "200");
    //   if (respdata.userid && respdata.authkey && respdata.alert.code == "200") {
    //     // console.log("HERE");
    //     // Meteor.users.update({
    //     //   services.AppGuestAuth.id: data.userid.toString(),
    //     //   services.AppGuestAuth.authkey: data.authkey,
    //     // },{$set: { 'services.AppAuth.id' }})
    //     let user = Accounts.updateOrCreateUserFromExternalService(
    //       "PharmAuth",
    //       {
    //         id: respdata.userid.toString(),
    //         authkey: respdata.authkey,
    //       },
    //       {
    //         profile: {},
    //       }
    //     );
    //     // console.log({ user });
    //     return user;
    //   } else {
    //     return {
    //       error: new Meteor.Error(400, respdata.alert.message, respdata),
    //     };
    //   }
    // } else if (!options.authkey) {
    //   console.log("Login NEW GUEST");
    //   const response = HTTP.post("https://service.socmedica.dev:9025/CreateGuest", {});
    //
    //   // let ex = {
    //   //   "userid": 0,
    //   //   authkey: "yrtUzJZqGJ2RX6g5D0zS73RL",
    //   //   email: null,
    //   //   master_service: "7",
    //   //   slave_service: "6",
    //   //   drugstore_id: null,
    //   //   master_authkey: null,
    //   //   slave_authkey: null,
    //   // };
    //
    //   const data = JSON.parse(response.content);
    //   // console.log(data);
    //   // console.log(data.userid, data.authkey, data.alert.code == "200");
    //   if (data.userid && data.authkey && data.alert.code == "200") {
    //     // console.log("HERE");
    //     let user = Accounts.updateOrCreateUserFromExternalService(
    //       "AppGuestAuth",
    //       {
    //         id: data.userid.toString(),
    //         authkey: data.authkey,
    //       },
    //       {
    //         profile: {},
    //       }
    //     );
    //     // console.log({ user });
    //     return user;
    //   }
    // } else {
    //   console.log("Login GUEST");
    //   let user = Accounts.updateOrCreateUserFromExternalService(
    //     "AppGuestAuth",
    //     {
    //       id: options.userid.toString(),
    //       authkey: options.authkey,
    //     },
    //     {
    //       profile: {},
    //     }
    //   );
    //   // console.log({ user });
    //   return user;
    // }
    // return undefined;
  });

  Meteor.publish("myFullUser", function () {
    // const user = Meteor.user();
    console.log(Meteor.userId());
    // if (user && user.roles && user.roles.length > 0) {
    return Meteor.users.find(Meteor.userId());
    // }
  });
  Meteor.methods({
    authorize: (email, password, service) => {
      let data = {
        email,
        password,
      };
      if (service) data.service = service;
      console.log({ data });
      return fetch(`${API_SERVER}/Authorize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((response) => {
        // console.log({ response });
        return response.json();
      });
    },
    newGuest: () => {
      return fetch(`${API_SERVER}/CreateGuest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }).then((response) => {
        return response.json();
      });
    },
  });
});
