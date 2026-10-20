import { observable, action, autorun } from "mobx";
import { Meteor } from "meteor/meteor";
import { meteorAsyncCall } from "../lib/helpers";

export const AUTH_SERVICE_KEY = "7e649ecb733d2af1";
export const RESET_PASS_KEY = "c47ee7e666d6be7e";

class User {
  @observable authorized = null;
  @observable me = null;
  @observable authkey = null;
  @observable userid = null;
  @observable role = null;
  @observable currPharm = null;
  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;
    this.depFullUser = new Tracker.Dependency();
    this.depMyUsers = new Tracker.Dependency();

    this.my = {
      data: observable.map({}, "users"),
      ready: observable.box(true),
    };

    Meteor.subscribe("myFullUser", () => {
      this.depFullUser.changed();
    });

    Meteor.subscribe("MyUsers", () => {
      this.depMyUsers.changed();
    });

    Meteor.users.find().observe({
      added: (newDocument, oldDocument) => {
        // console.log("added");
        this.depFullUser.changed();
      },
      updated: (newDocument, oldDocument) => {
        // console.log("updated");
        this.depFullUser.changed();
      },
      changed: (newDocument, oldDocument) => {
        // console.log("changed");
        this.depFullUser.changed();
      },
      removed: (newDocument) => {
        // console.log("removed");
        this.depFullUser.changed();
      },
    });
    Meteor.startup(() => {
      // console.log({ "this.authorized": this.authorized });
      // if (!this.authorized) {
      //   this.stores.router.push("/login");
      // }
    });

    // Tracker.autorun(() => {
    //   this.depMyUsers.depend();
    Meteor.users.find().observe({
      added: (newDocument, oldDocument) => {
        // console.log("user added", newDocument);
        if (newDocument.role && newDocument.role != "Admin") this.my.data.set(newDocument._id, newDocument);
      },
      updated: (newDocument, oldDocument) => {
        // console.log("user updated");
        if (newDocument.role && newDocument.role != "Admin") this.my.data.set(newDocument._id, newDocument);
      },
      removed: (newDocument) => {
        // console.log("user removed");
        if (newDocument.role && newDocument.role != "Admin") this.my.data.remove(newDocument._id, newDocument);
      },
    });
    // });

    Tracker.autorun(() => {
      this.depFullUser.depend();
      if (Meteor.loggingIn()) return;
      // console.log("here 1");
      const user = Meteor.user();
      // if (!user) return;
      console.log({ user: user });
      if (user) this.currPharm = user.currPharm || null;
      if (user && user.services && user.services.PharmAuth && !this.authkey) {
        // console.log("here 2");
        // if (user.services.PharmAuth) {
        // console.log({ PharmAuth: user.services.PharmAuth })
        // console.log({ user });
        this.authkey = user.services.PharmAuth.authkey;
        this.userid = user.services.PharmAuth.id;
        this.role = user.services.PharmAuth.role;

        this.me = user;
        // if (user.services.PharmAuth.role == "Admin") {
        //   Meteor.subscribe("MyUsers", () => {
        //     this.depMyUsers.changed();
        //   });
        // }
        localStorage.setItem("authkey", this.authkey);
        localStorage.setItem("userid", this.userid);
        this.authorized = true;
        setTimeout(() => {
          console.log("HERE 1");
          this.stores.router.push("/");
          this.loading = false;
        }, 200);
        // }
      } else {
        // console.log("autologin", this.authkey, this.userid, this.authorized);
        if (this.authkey && this.userid && !this.authorized) {
          // console.log("here 3");
          this.autologin();
        } else if (!this.authorized && this.stores.router && this.stores.router.match.section != "public") {
          // console.log("here redir", this.stores.router.match);
          this.stores.router && this.stores.router.push("/login");
        }
      }
    });

    Accounts.onLogin(() => {
      if (Meteor.loggingIn()) return;
      // console.log("here 4");
      // console.log("onLogin");
      const user = Meteor.user();
      const id = Meteor.userId();
      // console.log({ user, id });
      // FIX IT LATER
      if (user) this.currPharm = user.currPharm || null;
      if (user && user.services && user.services.PharmAuth) {
        // this.currPharm = user.currPharm || null;
        // console.log("here 5");
        // if (user.services.PharmAuth) {
        console.log("HERE 2");
        console.log({ PharmAuth: user.services.PharmAuth });
        this.stores.assortiment.subWithPharms();
        this.authkey = user.services.PharmAuth.authkey;
        this.userid = user.services.PharmAuth.id;
        this.role = user.services.PharmAuth.role;
        this.me = user;
        // if (user.services.PharmAuth.role == "Admin") {
        //   Meteor.subscribe("MyUsers", () => {
        //     this.depMyUsers.changed();
        //   });
        // }
        localStorage.setItem("authkey", this.authkey);
        localStorage.setItem("userid", this.userid);
        this.stores.router.push("/");
        // }
      } else {
        console.log("HERE");
        // this.fakelogin3();
      }
    });
  }

  async login() {
    // this.loginForm.key = AUTH_SERVICE_KEY;
    // let { privateKey, remember, ...data } = this.loginForm;
    // data.service = "4";\

    let { email, password } = this.stores.actions.loginForm;

    // console.log({ email, password });

    // let authkey = await localStorage.getItem("authkey");
    // let userid = await localStorage.getItem("userid");

    // if (this.authorized) return;
    let remember = true;
    // console.log({ authkey, userid });

    // if (authkey == "null")
    let authkey = null;
    // if (userid == "null")
    let userid = null;

    let data = { authkey, userid, auth: { email, password }, authType: "pharm" };

    Accounts.callLoginMethod({
      methodArguments: [data],
      userCallback: async (error, result) => {
        console.log({ error, result });
        if (error) {
          this.stores.actions.makeAlerts({ alerts: [error.details] });
          throw error;
        }
        this.authorized = true;
        this.stores.router.push("/");
        this.loading = false;
        // this.authkey = result.type.authkey;
        // this.privateKey = this.loginForm.privateKey;
        if (remember) {
          // await localStorage.setItem("authkey", this.authkey);
          // await localStorage.setItem("userid", this.userid);
        }
      },
    });
    return;
  }

  choicePharm = async (id) => {
    let { res, err } = await meteorAsyncCall("userChoicePharm", id);
    // console.log({ res, err });
  };

  async autologin() {
    let { authkey, userid } = this;
    let data = { authkey, userid, authType: "pharm" };
    Accounts.callLoginMethod({
      methodArguments: [data],
      userCallback: async (error, result) => {
        console.log({ error, result });
        if (error) {
          this.stores.actions.makeAlerts({ alerts: [error.details] });
          throw error;
        }
        this.authorized = true;
        this.stores.router.push("/");
        this.loading = false;
        // this.authkey = result.type.authkey;
        // this.privateKey = this.loginForm.privateKey;
        // if (remember) {
        //   // await localStorage.setItem("authkey", this.authkey);
        //   // await localStorage.setItem("userid", this.userid);
        // }
      },
    });
  }

  async logout() {
    // console.log("here 0");
    Meteor.call("customLogout", null, async (err, res) => {
      await localStorage.setItem("authkey", "");
      // console.log("here 1");
      await localStorage.setItem("userid", "");
      // console.log("here 2");
      this.authkey = null;
      // console.log("here 3");
      this.userid = null;
      // console.log("here 4");
      Meteor.logout();
      // console.log("here 5");
      this.stores.router.push("/login");
      // console.log("here 6");
      window.location.reload(false);
      // console.log("here 7s");
    });
    return;
  }

  async confirmInvite() {
    let { email, code, service, password, firstname, lastname, patronymic } = this.stores.actions.confirmInviteForm;
    let { res, err } = await meteorAsyncCall("confirmInvite", {
      email,
      code,
      service,
      password,
      firstname,
      lastname,
      patronymic,
    });
    if (res && res.alerts && res.alerts[0]) {
      this.stores.actions.makeAlerts({ alerts: res.alerts });
    } else if (err) {
      console.log({ res, err });
    }
  }

  async getUserById(id) {
    // console.log({ id });
    let { res, err } = await meteorAsyncCall("getUserById", id);
    // console.log({ res, err });
    return res;
  }
}
export default User;
