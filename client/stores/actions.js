import { observable, action, autorun } from "mobx";
import { GET, POST, PUT, PROJECT_TITLE } from "../lib/connect";
// import { Tracker } from "meteor/tracker";
import _ from "lodash";
import moment from "moment";

export const AUTH_SERVICE_KEY = "7e649ecb733d2af1";
export const RESET_PASS_KEY = "c47ee7e666d6be7e";
class Actions {
  @observable view = false;
  @observable device = null;
  @observable mobilewarning = false;
  @observable height = 0;
  @observable width = 0;

  @observable projectTitle = PROJECT_TITLE;

  @observable authorized = false;
  @observable loading = false;
  @observable dataLoading = false;
  @observable authkey = null;
  @observable userid = null;
  @observable privateKey = null;

  @observable pages = {};
  @observable currentPage = null;

  @observable alerts = {};

  @observable scanned = null;

  @observable loginForm = {
    email: "",
    password: "",
    privateKey: "",
    remember: true,
    hidden: true,
  };

  @observable signinForm = {
    email: "",
    password: "",
    lastName: "",
    firstName: "",
    middleName: "",
    hidden: true,
    service: "7",
  };

  @observable confirmForm = {
    email: "",
    code: "",
    service: "6", //админ сети - 7, провизор - 6, а юзер - 5
  };

  @observable getConfirmForm = {
    email: "",
  };

  @observable resetPassForm = {
    email: "",
    key: "",
  };

  @observable newPassForm = {
    email: "",
    code: "",
    password: "",
    key: "",
  };

  @observable inviteForm = {
    email: "",
    pharmId: "",
    firstname: "",
    lastname: "",
    patronymic: "",
  };

  @observable confirmInviteForm = {
    email: "",
    // pharmId: "",
    code: "",
    service: "",
    password: "",
    firstname: "",
    lastname: "",
    patronymic: "",
  };

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;
    this.depFullUser = new Tracker.Dependency();
    Meteor.subscribe("myFullUser", () => {
      this.depFullUser.changed();
    });
    Meteor.users.find().observe({
      added: (newDocument, oldDocument) => {
        // console.log('added');
        this.depFullUser.changed();
      },
      updated: (newDocument, oldDocument) => {
        // console.log('updated');
        this.depFullUser.changed();
      },
      removed: (newDocument) => {
        // console.log('removed');
        this.depFullUser.changed();
      },
    });
    // Meteor.startup(() => {});
    // Tracker.autorun(() => {
    //   this.depFullUser.depend();
    //   if (Meteor.loggingIn()) return;
    //   const user = Meteor.user();
    //   if (user && user.services && !this.authkey) {
    //     console.log({ "user.services": user.services });
    //     if (user.services.AppGuestAuth) {
    //       console.log({ AppGuestAuth: user.services.AppGuestAuth });
    //       this.authkey = user.services.AppGuestAuth.authkey;
    //       this.userid = user.services.AppGuestAuth.id;
    //       localStorage.setItem("authkey", this.authkey);
    //       localStorage.setItem("userid", this.userid);
    //     }
    //     if (user.services.PharmAuth) {
    //       console.log({ PharmAuth: user.services.PharmAuth });
    //       this.authkey = user.services.PharmAuth.authkey;
    //       this.userid = user.services.PharmAuth.id;
    //       localStorage.setItem("authkey", this.authkey);
    //       localStorage.setItem("userid", this.userid);
    //     }
    //     if (user.services.AppAuth) {
    //       console.log({ AppAuth: user.services.AppAuth });
    //       this.authkey = user.services.AppAuth.authkey;
    //       this.userid = user.services.AppAuth.id;
    //       localStorage.setItem("authkey", this.authkey);
    //       localStorage.setItem("userid", this.userid);
    //       this.authorized = true;
    //       this.stores.router.push("/");
    //       this.loading = false;
    //     }
    //
    //     // this.authkey = user.services.SocmedicaAuth.authkey;
    //     // setTimeout(() => this.autologin(), 300);
    //   }
    //   // console.log("autorun");
    //   // const user = Meteor.user();
    //   // // const id = Meteor.userId();
    //   // // console.log({ user, id });
    //   //
    //   // if (user && user.services) {
    //   //   console.log({ AppGuestAuth: user.services.AppGuestAuth });
    //   //   this.authkey = user.services.AppGuestAuth.authkey;
    //   //   this.userid = user.services.AppGuestAuth.id;
    //   //   localStorage.setItem("authkey", this.authkey);
    //   //   localStorage.setItem("userid", this.userid);
    //   //   // this.authkey = user.services.SocmedicaAuth.authkey;
    //   //   // setTimeout(() => this.autologin(), 300);
    //   // } else {
    //   //   this.fakelogin();
    //   // }
    //
    //   // if (user) {
    //   //   this.authorized = true;
    //   //   this.authkey = user.profile.authkey;
    //   // }
    // });
    //
    // Accounts.onLogin(() => {
    //   if (Meteor.loggingIn()) return;
    //   console.log("onLogin");
    //   const user = Meteor.user();
    //   const id = Meteor.userId();
    //   console.log({ user, id });
    //   // FIX IT LATER
    //   if (user && user.services) {
    //     if (user.services.AppGuestAuth) {
    //       console.log({ AppGuestAuth: user.services.AppGuestAuth });
    //       this.authkey = user.services.AppGuestAuth.authkey;
    //       this.userid = user.services.AppGuestAuth.id;
    //       localStorage.setItem("authkey", this.authkey);
    //       localStorage.setItem("userid", this.userid);
    //     }
    //     if (user.services.PharmAuth) {
    //       console.log({ PharmAuth: user.services.PharmAuth });
    //       this.authkey = user.services.PharmAuth.authkey;
    //       this.userid = user.services.PharmAuth.id;
    //       localStorage.setItem("authkey", this.authkey);
    //       localStorage.setItem("userid", this.userid);
    //     }
    //     if (user.services.AppAuth) {
    //       console.log({ AppAuth: user.services.AppAuth });
    //       this.authkey = user.services.AppAuth.authkey;
    //       this.userid = user.services.AppAuth.id;
    //       localStorage.setItem("authkey", this.authkey);
    //       localStorage.setItem("userid", this.userid);
    //     }
    //
    //     // this.authkey = user.services.SocmedicaAuth.authkey;
    //     // setTimeout(() => this.autologin(), 300);
    //   } else {
    //     // this.fakelogin3();
    //   }
    // });

    // autorun(() => {
    //   console.log(this.currentPage);
    //   if(this.currentPage && _.keys(this.pages).length > 0){
    //     this.stores.db.clearData()
    //     this.stores.db.getFilters()
    //   }
    // });
    // console.log(window);
    this.onResize();
    window.onresize = this.onResize;
  }

  async onResize() {
    //console.log('resize');
    let h = await window.innerHeight;
    let w = await window.innerWidth;
    let v = h > w ? "portrait" : "landscape";
    let d =
      (w < 480 && v === "portrait") || (w < 1024 && v === "landscape")
        ? "mobile"
        : (w < 1280 && v === "portrait") || (w < 1280 && v === "landscape")
        ? "tablet"
        : "pc";
    this.mobilewarning = d === "mobile" || d === "tablet";
    this.view = v;
    this.device = d;
    // console.log(d);
    this.height = h;
    this.width = w;
  }

  setCurrentPage(page) {
    if (page) {
      this.currentPage = page;
      if (this.currentPage && _.keys(this.pages).length > 0) {
        this.stores.db.clearData();
        this.stores.db.getFilters();
      }
    }
  }

  clearSteps(step) {
    if (step === 1) {
    }
    if (step == 2) {
    }
    // stepsData = {
    //   way: null,
    //   step: null,
    //   lf: null,
    //   dosage: null,
    //   method: null,
    //
    // }
  }

  makeAlerts(data) {
    if (data.alerts && data.alerts.length > 0) {
      data.alerts.forEach((item, i) => {
        let key = Math.floor(Math.random() * 10000);
        this.alerts[key] = item;
      });
    }
  }

  async getObject(name) {
    return POST({
      path: `info/${name}`,
      data: {},
      success: async (data) => {
        let { alert, ...values } = data;
        //this[name]
        Object.assign(this[name], { ...values });
        // console.log(this[name]);
      },
      fail: (alerts) => {
        this.loading = false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  getElement = (name, value) => {
    // console.log({ el: this.elements, name, value});
    let text = "";
    this.elements[name].forEach((item, i) => {
      if (item.from <= value && value < item.to) {
        text = item.name;
      }
    });
    return text;
  };

  async autologin() {
    // this.getObject('buttonTexts')
    // this.getObject('elements')

    // this.loading = true;
    // this.authkey = (await localStorage.getItem("authkey")) || "";
    if (!this.authkey && this.stores.router.match.section !== "auth" && this.stores.router.match.section !== "public") {
      this.loading = false;
      this.stores.router.push("/login");
      return;
    }

    if (this.stores.router.match.section == "public") {
      this.loading = false;
      return;
    }
    if (!this.authkey) {
      this.loading = false;
      return;
    }

    return GET({
      path: `https://cs.socmedica.com/api/user/authCheck`, //'https://dev.socmedica.com/2/api/stats/CheckAuthTrue', //
      data: {
        authkey: this.authkey,
        key: AUTH_SERVICE_KEY,
      },
      success: async (data) => {
        //console.log('logged', data);
        this.loginForm.privateKey = this.privateKey; //= (await localStorage.getItem("privateKey")) || "";
        // this.login();
        this.authorized = true;
        this.loading = false;

        // this.stores.db.getLPU();

        this.stores.router.push("/");
        // this.stores.db.getFilters()
      },
      fail: () => {
        // console.log('FAIL');
        this.stores.router.push("/login");
        this.authorized = false;
        this.loading = false;
      },
      always: (data) => {
        this.makeAlerts(data);

        this.loading = false;
      },
    });
  }

  async login() {
    //this.loginForm.key = AUTH_SERVICE_KEY;
    let { privateKey, remember } = this.loginForm;
    let data = {
      key: privateKey,
      authkey: this.authkey,
    };
    return POST({
      path: `SKOL/GetUserRights`,
      data,
      success: async (data) => {
        //console.log('SUCCESS', data);
        if (data.alerts && data.alerts[0] && data.alerts[0].level == "success") {
          this.privateKey = this.loginForm.privateKey;
          this.stores.router.push("/");
          this.authorized = true;
          this.loading = false;
          if (remember) {
            await localStorage.setItem("authkey", this.authkey);
            await localStorage.setItem("privateKey", this.loginForm.privateKey);
          }
        } else {
          this.makeAlerts({
            alerts: [
              {
                title: "Неверный персональный ключ.",
                message: "проверьте правильность ключа.",
                level: "error",
                sticky: false,
              },
            ],
          });
        }
      },
      fail: (alerts) => {
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.loading = false;
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  async fakelogin() {
    // this.loginForm.key = AUTH_SERVICE_KEY;
    // let { privateKey, remember, ...data } = this.loginForm;
    // data.service = "4";\

    let { email, password } = this.loginForm;

    // console.log({ email, password });

    let authkey = await localStorage.getItem("authkey");
    let userid = await localStorage.getItem("userid");

    // if (this.authorized) return;
    let remember = true;
    console.log({ authkey, userid });

    // if (authkey == "null")
    authkey = null;
    // if (userid == "null")
    userid = null;

    let data = { authkey, userid, auth: { email, password }, authType: "app" };

    Accounts.callLoginMethod({
      methodArguments: [data],
      userCallback: async (error, result) => {
        console.log({ error, result });
        if (error) {
          this.makeAlerts({ alerts: [error] });
          throw error;
        }
        this.authorized = true;
        this.stores.router.push("/");
        this.loading = false;
        // this.authkey = result.type.authkey;
        this.privateKey = this.loginForm.privateKey;
        if (remember) {
          // await localStorage.setItem("authkey", this.authkey);
          // await localStorage.setItem("userid", this.userid);
        }
      },
    });
    return;

    return await POST({
      path: `https://cs.socmedica.com/api/user/authorization`,
      data,
      success: async (data) => {
        // console.log('SUCCESS', data);
        // this.makeAlerts({ alerts:[{
        //   title: "Введите ключ.",
        //   message: "Для входа в систему необходимо ввести ваш персональный ключ. Если у вас его нет, обратитесь к поставщику ПО.",
        //   level: "info",
        //   sticky: false
        // }]})
        if (data.authkey) {
          this.privateKey = this.loginForm.privateKey;
          this.authkey = data.authkey;

          this.stores.router.push("/");
          this.authorized = true;
          this.loading = false;
          if (remember) {
            await localStorage.setItem("authkey", this.authkey);
            await localStorage.setItem("userid", this.userid);
            // await localStorage.setItem("privateKey", this.loginForm.privateKey);
          }

          //this.privateKey = this.loginForm.privateKey
          // this.stores.router.push('/')
          // this.authorized = true
          //this.loading = false
          // this.stores.db.getFilters()
        }
        return true;
      },
      fail: (alerts) => {
        this.loading = false;
        return false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data);
        //console.log('ALWAYS', data);
      },
    });
  }

  async fakelogin3() {
    // this.loginForm.key = AUTH_SERVICE_KEY;
    // let { privateKey, remember, ...data } = this.loginForm;
    // data.service = "4";\

    let { email, password } = this.loginForm;

    // console.log({ email, password });

    let authkey = await localStorage.getItem("authkey");
    let userid = await localStorage.getItem("userid");

    // if (this.authorized) return;
    let remember = true;
    console.log({ authkey, userid });

    if (authkey == "null") authkey = null;
    if (userid == "null") userid = null;

    let data = { authkey, userid, authType: "app" };

    Accounts.callLoginMethod({
      methodArguments: [data],
      userCallback: async (error, result) => {
        console.log({ error, result });
        if (error) {
          this.makeAlerts({ alerts: [error] });
          throw error;
        }
        this.authorized = true;
        this.stores.router.push("/");
        this.loading = false;
        // this.authkey = result.type.authkey;
        this.privateKey = this.loginForm.privateKey;
        if (remember) {
          // await localStorage.setItem("authkey", this.authkey);
          // await localStorage.setItem("userid", this.userid);
        }
      },
    });
    return;

    return await POST({
      path: `https://cs.socmedica.com/api/user/authorization`,
      data,
      success: async (data) => {
        // console.log('SUCCESS', data);
        // this.makeAlerts({ alerts:[{
        //   title: "Введите ключ.",
        //   message: "Для входа в систему необходимо ввести ваш персональный ключ. Если у вас его нет, обратитесь к поставщику ПО.",
        //   level: "info",
        //   sticky: false
        // }]})
        if (data.authkey) {
          this.privateKey = this.loginForm.privateKey;
          this.authkey = data.authkey;

          this.stores.router.push("/");
          this.authorized = true;
          this.loading = false;
          if (remember) {
            await localStorage.setItem("authkey", this.authkey);
            await localStorage.setItem("userid", this.userid);
            // await localStorage.setItem("privateKey", this.loginForm.privateKey);
          }

          //this.privateKey = this.loginForm.privateKey
          // this.stores.router.push('/')
          // this.authorized = true
          //this.loading = false
          // this.stores.db.getFilters()
        }
        return true;
      },
      fail: (alerts) => {
        this.loading = false;
        return false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data);
        //console.log('ALWAYS', data);
      },
    });
  }

  async signin() {
    this.signinForm.key = AUTH_SERVICE_KEY;
    return POST({
      path: `https://cs.socmedica.com/api/registration/send`,
      data: this.signinForm,
      success: async (data) => {
        this.stores.router.push("/login");
      },
      fail: (alerts) => {
        this.loading = false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  async confirm() {
    this.confirmForm.key = AUTH_SERVICE_KEY;
    return POST({
      path: `https://cs.socmedica.com/api/registration/confirmemail`,
      data: this.confirmForm,
      success: async (data) => {
        console.log("SUCCESS", data);
        this.stores.router.push("/login");
      },
      fail: (alerts) => {
        this.loading = false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  async getConfirm() {
    return POST({
      path: `https://cs.socmedica.com/api/registration/getconfirmemail`,
      data: this.getConfirmForm,
      success: async (data) => {
        console.log("SUCCESS", data);
        this.stores.router.push("/confirm");
      },
      fail: (alerts) => {
        this.loading = false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  async resetPass() {
    this.resetPassForm.key = RESET_PASS_KEY;
    return POST({
      path: `https://cs.socmedica.com/api/user/recovery`,
      data: this.resetPassForm,
      success: async (data) => {
        console.log("SUCCESS", data);
        this.stores.router.push("/newpass");
      },
      fail: (alerts) => {
        this.loading = false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  async newPass() {
    this.newPassForm.key = RESET_PASS_KEY;
    return POST({
      path: `https://cs.socmedica.com/api/user/resetPassword`,
      data: this.newPassForm,
      success: async (data) => {
        console.log("SUCCESS", data);
        this.stores.router.push("/login");
      },
      fail: (alerts) => {
        this.loading = false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }
}
export default Actions;
