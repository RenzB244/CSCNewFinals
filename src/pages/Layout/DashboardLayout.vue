<template>
  <div class="wrapper" :class="{ 'nav-open': $sidebar.showSidebar }">
    <notifications></notifications>

    <side-bar
      :sidebar-item-color="sidebarBackground"
      :sidebar-background-image="sidebarBackgroundImage"
      :title="sidebarTitle"
      :imgLogo="csuLogo"
    >
      <mobile-menu slot="content"></mobile-menu>
      <template v-if="isTutor">
        <sidebar-link to="/tutor-dashboard">
          <md-icon>dashboard</md-icon>
          <p>Home</p>
        </sidebar-link>
        <sidebar-link v-if="isTutorApproved" to="/tutor-requests">
          <md-icon>description</md-icon>
          <p>Requests</p>
        </sidebar-link>
        <sidebar-link v-if="isTutorApproved" to="/tutor-schedule">
          <md-icon>event</md-icon>
          <p>Schedule</p>
        </sidebar-link>
        <sidebar-link v-if="isTutorApproved" to="/tutor-messages">
          <md-icon>chat</md-icon>
          <p>Messages</p>
        </sidebar-link>
        <sidebar-link v-if="isTutorApproved" to="/tutor-feedback">
          <md-icon>star</md-icon>
          <p>Feedback</p>
        </sidebar-link>
      </template>
      <template v-else>
        <sidebar-link to="/learner-dashboard">
          <md-icon>dashboard</md-icon>
          <p>Home</p>
        </sidebar-link>
        <sidebar-link to="/learner-requests">
          <md-icon>description</md-icon>
          <p>Requests</p>
        </sidebar-link>
        <sidebar-link to="/learner-schedule">
          <md-icon>event</md-icon>
          <p>Schedule</p>
        </sidebar-link>
        <sidebar-link to="/learner-messages">
          <md-icon>chat</md-icon>
          <p>Messages</p>
        </sidebar-link>
        <sidebar-link to="/learner-feedback">
          <md-icon>star</md-icon>
          <p>Feedback</p>
        </sidebar-link>
        <sidebar-link to="/user">
          <md-icon>person</md-icon>
          <p>Profile</p>
        </sidebar-link>
      </template>
      <li class="md-list-item">
        <a
          href="#"
          class="md-list-item-router md-list-item-container md-button-clean active-pro"
          @click.prevent="logout"
        >
          <div class="md-list-item-content md-ripple">
            <md-icon>exit_to_app</md-icon>
            <p>Logout</p>
          </div>
        </a>
      </li>
    </side-bar>

    <div class="main-panel">
      <top-navbar></top-navbar>

      <fixed-plugin
        :color.sync="sidebarBackground"
        :image.sync="sidebarBackgroundImage"
      >
      </fixed-plugin>

      <dashboard-content> </dashboard-content>

      <content-footer v-if="!$route.meta.hideFooter"></content-footer>
    </div>
  </div>
</template>

<script>
import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";
import MobileMenu from "@/pages/Layout/MobileMenu.vue";
import FixedPlugin from "./Extra/FixedPlugin.vue";
import { logoutUser, getCurrentUser } from "@/helpers/storage";

export default {
  components: {
    TopNavbar,
    DashboardContent,
    ContentFooter,
    MobileMenu,
    FixedPlugin,
  },
  data() {
    return {
      sidebarBackground: "green",
      sidebarBackgroundImage: require("@/assets/img/sidebar-2.jpg"),
      csuLogo: require("@/assets/img/csu-logo.png"),
    };
  },
  computed: {
    isTutor() {
      const user = getCurrentUser();
      return user && user.role === "tutor";
    },
    isTutorApproved() {
      const user = getCurrentUser();
      return user && user.role === "tutor" && user.status === "approved";
    },
    sidebarTitle() {
      return "Peer to Peer Tutorial";
    },
  },
  methods: {
    logout() {
      logoutUser();
      // Force navigation to login page
      this.$router.push("/login").catch((err) => {
        // Ignore navigation duplicate errors
        if (err.name !== "NavigationDuplicated") {
          console.error(err);
        }
      });
    },
  },
};
</script>
