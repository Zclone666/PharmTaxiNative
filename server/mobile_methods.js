import { Meteor } from "meteor/meteor";

import SERVER from "../../both/constants";
import { API_SERVER } from "./main";

// prettier-ignore
Meteor.methods({
  'passwordRecovery'(params) {
    console.log('inside password recovery method')
    const response = HTTP.post(`${API_SERVER}/api/user/authorization2`, {
      data: params
    });

    const responseData = response.data;

    console.log('passwordRecovery', {responseData})

    return "password was successfully changed"
  },

  'customLogout'(params) {
    // path: `https://cs.socmedica.com/api/user/authexit`,
    //   data: {
    //     authkey: localStorage.getItem("authkey"),
    //   },
    // console.log("meteor method logout params: ", params)
    // console.log("meteor user: ", Meteor.user())
    const authkey = Meteor.user().services.SocmedicaAuth.authkey;
    // console.log({authkey})

    const response = HTTP.get(`${API_SERVER}/api/user/authexit?authkey=` + authkey)

    console.log("meteor server logout", {response})

    return "user was successfully logged out"
  },

  'ReadBarcode'(params) {
    const authkey = Meteor.user().services.SocmedicaAuth.authkey;
    console.log('ReadBarcodeParams', {params}, {authkey})
    const data = { authkey, code: params.barcode };

    const response = HTTP.post("https://docker.socmedica.dev:9001/SKOL/ReadBarcode", {data});
    console.log( JSON.parse(response.content));
    const responseData = JSON.parse(response.content);
    return responseData;
  },

})
