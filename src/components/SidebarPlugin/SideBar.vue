<template>
  <div
    class="sidebar"
    :data-color="sidebarItemColor"
    :data-image="sidebarBackgroundImage"
    :style="sidebarStyle"
  >
    <div class="logo" style="text-align: center;">
      <a href="#" class="simple-text logo-mini" style="display: block; margin: 0 auto; float: none;">
        <div class="logo-img" style="width: 80px; height: 80px; margin: 0 auto;">
          <img :src="imgLogo" alt="" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
      </a>

      <a
        href="#"
        class="simple-text logo-normal"
        style="text-decoration: none; text-align: center; display: block; width: 100%; margin-top: 10px;"
      >
        {{ title }}
      </a>
    </div>
    <div class="sidebar-wrapper">
      <slot name="content"></slot>
      <md-list class="nav">
        <!--By default vue-router adds an active class to each route link. This way the links are colored when clicked-->
        <slot>
          <sidebar-link
            v-for="(link, index) in sidebarLinks"
            :key="link.name + index"
            :to="link.path"
            :link="link"
          >
          </sidebar-link>
        </slot>
      </md-list>
    </div>
  </div>
</template>
<script>
import SidebarLink from "./SidebarLink.vue";

export default {
  components: {
    SidebarLink,
  },
  props: {
    title: {
      type: String,
      default: "Vue MD",
    },
    sidebarBackgroundImage: {
      type: String,
      default: require("@/assets/img/sidebar-2.jpg"),
    },
    imgLogo: {
      type: String,
      default: require("@/assets/img/csu-logo.png"),
    },
    sidebarItemColor: {
      type: String,
      default: "green",
      validator: (value) => {
        let acceptedValues = ["", "purple", "blue", "green", "orange", "red"];
        return acceptedValues.indexOf(value) !== -1;
      },
    },
    sidebarLinks: {
      type: Array,
      default: () => [],
    },
    autoClose: {
      type: Boolean,
      default: true,
    },
  },
  provide() {
    return {
      autoClose: this.autoClose,
    };
  },
  computed: {
    sidebarStyle() {
      return {
        backgroundImage: `url(${this.sidebarBackgroundImage})`,
      };
    },
  },
};
</script>
<style scoped>
.logo {
  text-align: center !important;
  padding: 20px 0 !important;
}

.logo-mini {
  float: none !important;
  display: block !important;
  margin: 0 auto !important;
  width: auto !important;
}

.logo-img {
  width: 80px !important;
  height: 80px !important;
  margin: 0 auto !important;
  display: block !important;
  background: #fff !important;
  border-radius: 50% !important;
  padding: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.logo-img img {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
  display: block !important;
}

.logo-normal {
  font-size: 14px !important;
  font-weight: bold !important;
  color: #fff !important;
  text-align: center !important;
  line-height: 1.4 !important;
  display: block !important;
  width: 100% !important;
  margin: 10px auto 0 !important;
  padding: 0 !important;
}

@media screen and (min-width: 991px) {
  .nav-mobile-menu {
    display: none;
  }
}
</style>
