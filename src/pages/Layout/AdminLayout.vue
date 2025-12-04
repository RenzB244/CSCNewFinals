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
      <sidebar-link to="/admin/home">
        <md-icon>dashboard</md-icon>
        <p>Home</p>
      </sidebar-link>
      <sidebar-link to="/admin/approvals">
        <md-icon>assignment</md-icon>
        <p>Requests</p>
      </sidebar-link>
      <sidebar-link to="/admin/users">
        <md-icon>people</md-icon>
        <p>The Users</p>
      </sidebar-link>
      <sidebar-link to="/admin/messages">
        <md-icon>message</md-icon>
        <p>Message</p>
      </sidebar-link>
      <sidebar-link to="/admin/schedule">
        <md-icon>event</md-icon>
        <p>Schedule</p>
      </sidebar-link>
      <sidebar-link to="/admin/earnings">
        <md-icon>attach_money</md-icon>
        <p>Total Earnings</p>
      </sidebar-link>
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
import { logoutUser } from "@/helpers/storage";

export default {
  components: {
    TopNavbar,
    DashboardContent,
    ContentFooter,
    MobileMenu,
  },
  data() {
    return {
      sidebarBackground: "purple",
      sidebarBackgroundImage: require("@/assets/img/sidebar-2.jpg"),
      csuLogo: require("@/assets/img/csu-logo.png"),
    };
  },
  computed: {
    sidebarTitle() {
      return "Peer to Peer Tutorial";
    },
  },
  methods: {
    logout() {
      logoutUser();
      this.$router.push("/login").catch((err) => {
        if (err.name !== "NavigationDuplicated") {
          console.error(err);
        }
      });
    },
  },
};
</script>

