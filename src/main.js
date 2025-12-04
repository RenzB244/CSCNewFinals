// =========================================================
// * Vue Material Dashboard - v1.5.2
// =========================================================
//
// * Product Page: https://www.creative-tim.com/product/vue-material-dashboard
// * Copyright 2024 Creative Tim (https://www.creative-tim.com)
// * Licensed under MIT (https://github.com/creativetimofficial/vue-material-dashboard/blob/master/LICENSE.md)
//
// * Coded by Creative Tim
//
// =========================================================
//
// * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App";

// router setup
import routes from "./routes/routes";
import { getCurrentUser } from "./helpers/storage";

// Plugins
import GlobalComponents from "./globalComponents";
import GlobalDirectives from "./globalDirectives";
import Notifications from "./components/NotificationPlugin";

// MaterialDashboard plugin
import MaterialDashboard from "./material-dashboard";

import Chartist from "chartist";

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  linkExactActiveClass: "nav-item active",
});

router.beforeEach((to, from, next) => {
  const publicPages = ["/login", "/signup"];
  const authRequired = !publicPages.includes(to.path);
  const currentUser = getCurrentUser();

  if (authRequired && !currentUser) {
    return next("/login");
  }

  if (to.path.startsWith("/admin") && (!currentUser || currentUser.role !== "admin")) {
    // Redirect to appropriate dashboard based on role
    if (currentUser && currentUser.role === "tutor") {
      return next("/tutor-dashboard");
    }
    if (currentUser && currentUser.role === "user") {
      return next("/learner-dashboard");
    }
    return next("/login");
  }

  // Redirect tutors from regular dashboard to tutor dashboard
  if (to.path === "/dashboard" && currentUser) {
    if (currentUser.role === "tutor") {
      return next("/tutor-dashboard");
    } else if (currentUser.role === "user") {
      return next("/learner-dashboard");
    }
  }

  // Redirect regular users from tutor routes to learner dashboard
  if (
    to.path.startsWith("/tutor-") &&
    currentUser &&
    currentUser.role !== "tutor"
  ) {
    return next("/learner-dashboard");
  }

  // Redirect tutors from learner routes to tutor dashboard
  if (
    to.path.startsWith("/learner-") &&
    currentUser &&
    currentUser.role === "tutor"
  ) {
    return next("/tutor-dashboard");
  }

  // Block pending tutors from accessing tutor features (except home)
  if (
    currentUser &&
    currentUser.role === "tutor" &&
    currentUser.status !== "approved" &&
    to.path !== "/tutor-dashboard" &&
    to.path.startsWith("/tutor-")
  ) {
    return next("/tutor-dashboard");
  }

  next();
});

Vue.prototype.$Chartist = Chartist;

Vue.use(VueRouter);
Vue.use(MaterialDashboard);
Vue.use(GlobalComponents);
Vue.use(GlobalDirectives);
Vue.use(Notifications);

/* eslint-disable no-new */
new Vue({
  el: "#app",
  render: (h) => h(App),
  router,
  data: {
    Chartist: Chartist,
  },
});
