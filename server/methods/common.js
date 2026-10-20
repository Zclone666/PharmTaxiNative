import { Meteor } from "meteor/meteor";
export const AUTH_SERVICE_KEY = "1591f0189d8062fb";
export const RESET_PASS_KEY = "cfaabb92bbf2f44e";
export const REQUEST_PASS_KEY = "70f1a529fafb5e60";
export const CHECK_REG_KEY = "1a7154198f39fc39";
import Future from "fibers/future";

import SERVER from "../../both/constants";
import { API_SERVER } from "../main";

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
    const user = Meteor.user()
    const authkey = user.services && ((user.services.PharmAuth && user.services.PharmAuth.authkey) || (user.services.AppAuth && user.services.AppAuth.authkey));
    // console.log({authkey})

    const response = HTTP.get(`${API_SERVER}/api/user/authexit?authkey=` + authkey)

    console.log("meteor server logout", {response})

    return "user was successfully logged out"
  },

  'ReadBarcode'(params) {
    const authkey = Meteor.user() && Meteor.user().services.SocmedicaAuth && Meteor.user().services.SocmedicaAuth.authkey;

    // console.log('ReadBarcodeParams', {params}, {authkey})
    const data = {
      authkey,
      "text": params.data ,
      "format": params.type ,
      "coords": params.coords,
      "accuracy": params.accuracy,
      "lang": "ru",
      "mode": "work",
      "country": "ru"
    };
    // console.log({data});

    const response = HTTP.post(`${API_SERVER}/Check`, {data});
    // console.log( {response});
    const responseData = JSON.parse(response.content);
    // console.log({responseData});
    return responseData
    // return {...responseData, requestData: data};
  },

   createPharmNet(pharmNet){
    let fut = new Future();
    let authkey = Meteor.user() && Meteor.user().services.PharmAuth && Meteor.user().services.PharmAuth.authkey;
    let userId = Meteor.user() && Meteor.user().services.PharmAuth && Meteor.user().services.PharmAuth.id.toString();
    if(!authkey) return

    const { typeText, address, license, phone, title } = pharmNet;
    // console.log({data});

    const data = { authkey, userId, parentId: null, typeText, address, license, phone, title }



    fetch(`${API_SERVER}/CreateDrugNet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      let res = await response.json();
      fut.return(res);
    });

    return fut.wait();
  },

  'saveOrder'(order){

    let authkey = Meteor.user() && Meteor.user().services.AppGuestAuth && Meteor.user().services.AppGuestAuth.authkey;
    if(!authkey) authkey = Meteor.user() && Meteor.user().services.AppAuth && Meteor.user().services.AppAuth.authkey;

    // console.log('ReadBarcodeParams', {params}, {authkey})
    const data = {
      authkey,
      order
    };
    // console.log({data});

    const response = HTTP.post(`${API_SERVER}/SaveOrder`, {data});
    // console.log( {response});
    const responseData = JSON.parse(response.content);
    // console.log({responseData});
    return responseData;
  },

  'saveFakeOrder'(order){

    let authkey = Meteor.user() && Meteor.user().services.AppGuestAuth && Meteor.user().services.AppGuestAuth.authkey;
    if(!authkey) authkey = Meteor.user() && Meteor.user().services.AppAuth && Meteor.user().services.AppAuth.authkey;

    // console.log('ReadBarcodeParams', {params}, {authkey})
    const data = {
      authkey,
      ...order
    };
    // console.log(JSON.stringify(data));

    const response = HTTP.post(`${API_SERVER}/SaveFakeOrder`, {data});
    // console.log( {response});
    const responseData = JSON.parse(response.content);
    // console.log({responseData});
    return responseData;
  },

  'savePatientToUser'(params){
    // const authkey = Meteor.user() && Meteor.user().services.AppGuestAuth && Meteor.user().services.AppGuestAuth.authkey;

    if(!Meteor.userId()) return {
          error: new Meteor.Error(400, 'Вы не авторизованы'),
        };

    Meteor.users.update({_id: Meteor.userId()}, {$set: {patient: params}})


  },

  'saveUserSettings'(settings){
    // const authkey = Meteor.user() && Meteor.user().services.AppGuestAuth && Meteor.user().services.AppGuestAuth.authkey;
    let {distance, analogs, fullList, partners} = settings
    if(!Meteor.userId()) return {
      error: new Meteor.Error(400, 'Вы не авторизованы'),
    };

    Meteor.users.update({_id: Meteor.userId()}, {$set: {distance, analogs, fullList, partners}})


  },

  'fromGuest': async (auth)=>{
    console.log(Meteor.userId());
    if(!Meteor.userId()) {
      throw new Meteor.Error(400, 'Вы не авторизованы (UID)')
    };
    const user = Meteor.user()
    let authkey = user.services.AppGuestAuth && user.services.AppGuestAuth.authkey;
    const userid = user.services.AppGuestAuth && user.services.AppGuestAuth.id;
    if(!authkey) {
      throw new Meteor.Error(400, 'Вы не авторизованы')
    };
    //if(!authkey) authkey = 'qZU5AwG7RTShK0gfc8WxQ4FP'
    const {
      key,
      // email,
      phone,
      name,
      // fio,
      firstname,
      lastname,
      patronymic,
      snils,
      miscode,
      misid,
      birthdate,
      sex,
      growth,
      weight,
      masIndex,
      disease,
      co_disease,
      allergy,
      labparams,
      mutations,
      pregnancy,
      gestation,
      trimester,
      lactation,
      driving,
      alcohol
    } = user.patient || {}
    const {
    //   firstname,
    // lastname,
    // patronymic,
      email,
      password
    } = auth
    const fio = `${lastname} ${firstname} ${patronymic}`


    const data = {
      authkey,
      email,
      password,
      firstName: firstname || 'A',
      lastName: lastname || 'A',
      middleName: patronymic || 'A',
    }
    console.log(data);

    if(!authkey){
      throw new Meteor.Error(400, 'No authkey', {"alert":{"code":"400","title":"No authkey","message":"You dont logged in","level":"error","sticky":false}})
    }
    // const responseAuth = HTTP.post("https://service.socmedica.dev:9025/CreateUserFromGuest", {data});
    const responseAuth = await fetch(`${API_SERVER}/CreateUserFromGuest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        authkey,
        email,
        password,
        firstName: firstname || 'A',
        lastName: lastname || 'A',
        middleName: patronymic || 'A',
      })
    }).then((response)=>{
      return response.json()
    })
    console.log({responseAuth, errors: responseAuth.errors});
    // return
    // {"authkey":"xBEAQ82jtpoh2DEtWufbr7Lc","user_id":6181,"alert":{"code":"200","title":"OK","message":"Доступ разрешен","level":"success","sticky":false}}

    if(!(responseAuth.alert && responseAuth.alert.code == '200')){
      throw new Meteor.Error(400, responseAuth.alert && responseAuth.alert.message || '', responseAuth)
    }


    authkey = responseAuth.authkey

    let {user_id} = responseAuth

    Meteor.users.update({_id: Meteor.userId()}, {$set: {isGuest: false, 'patient.email' : email}})

    return {authkey, user_id}

    let barrel = {
      "permit": {
        "key": "megabackdoorDanyaLikeTits",
        "authkey": authkey,
        "application": "5",
      },
      "patientInfo": {
        "userid": user_id,
        "patient": {
          "email": email,
          "fio": fio,
          "firstname": firstname,
          "lastname": lastname,
          "patronymic": patronymic,

          "snils": snils,
          "phone": phone,
          "passport": null,
          "birthdate": birthdate,
          "sex": sex,
          "growth": growth,
          "weight": weight,
          "disease": disease,
          "co_disease": co_disease,
          "pregnancy": pregnancy,
          "gestation": gestation,
          "trimester": trimester,
          "lactation": lactation,
          "driving": driving,
          "alcohol": alcohol,
          "allergy": allergy,
          "labparams": labparams,
          "mutations": mutations
        }
      }
    }

    // console.log(barrel);
    // console.log({
    //   "permit": {
    //     "key": "megabackdoorholyshit",
    //     "authkey": authkey,
    //     // "application": "5",
    //     "login": null,
    //     // "authkey": null
    //   },
    //   "currentPat": {
    //     "email": email,
    //     // "fio": 'Александров Даниил Сергеевич',
    //
    //   }
    // });

    const responseMed = HTTP.post("https://service.socmedica.dev:9007/FTCheckPatientV2", {data: barrel});

    // console.log();

    // const responseMed = HTTP.post("https://service.socmedica.dev:9007/FindPatFilter", {data: {
    //   "permit": {
    //     "key": "megabackdoorholyshit",
    //     "authkey": authkey,
    //     // "application": "5",
    //     "login": null,
    //     // "authkey": null
    //   },
    //   "currentPat": {
    //     "email": email,
    //     // "fio": 'Александров Даниил Сергеевич',
    //   }
    // }});
    let resMed = JSON.parse(responseMed.content);
    console.log({res: resMed.patResult});
    // Meteor.users.update({_id: Meteor.userId()}, {$set: {isGuest: false}})


  },

  'checkEmail': async (email) => {
    if(!Meteor.userId()) return {
      error: new Meteor.Error(400, 'Вы не авторизованы'),
    };
    const user = Meteor.user()

    // const responseMed = HTTP.post("https://cs.socmedica.com/api/user/getUserInfoByEmail", {data: {
    //   email,
    //   key: '340f725c9ccb9779',
    // }});

    const responseMed = await fetch(`${API_SERVER}/api/user/getUserInfoByEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        key: '1a7154198f39fc39',
      })
    }).then((response)=>{
      return response.json()
    })
    return responseMed
    // console.log(responseMed);
  },

  'fakeLogin': async ({email, password}) => {
    if(!Meteor.userId()) return {
      error: new Meteor.Error(400, 'Вы не авторизованы'),
    };
    const user = Meteor.user()
    Meteor.users.update({_id: Meteor.userId()}, {$set: {isGuest: false, email, password}})
  }
})
