<template>
  <md-card class="md-card-profile">
    <div class="md-card-avatar">
      <img class="img" :src="profileImage" />
    </div>

    <md-card-content>
      <h6 class="category text-gray">{{ userRole }}</h6>
      <h4 class="card-title">{{ userName }}</h4>
      <p class="card-description">
        {{ displayBio }}
      </p>
      <md-button v-if="!isCurrentUser" class="md-round md-success">Follow</md-button>
    </md-card-content>
  </md-card>
</template>
<script>
import { getCurrentUser } from "@/helpers/storage";

export default {
  name: "user-card",
  data() {
    return {
      refreshKey: 0,
    };
  },
  computed: {
    currentUser() {
      // Force reactivity by accessing getCurrentUser
      this.refreshKey;
      return getCurrentUser();
    },
    userName() {
      if (this.currentUser) {
        return this.currentUser.name || "User";
      }
      return "User";
    },
    userRole() {
      if (this.currentUser) {
        if (this.currentUser.role === "tutor") {
          return "Tutor";
        } else if (this.currentUser.role === "admin") {
          return "Administrator";
        }
        return "User";
      }
      return "User";
    },
    displayBio() {
      if (this.currentUser) {
        // Check tutorBio first (from form), then bio, then aboutme
        return this.currentUser.tutorBio || this.currentUser.bio || this.currentUser.aboutme || "No bio available.";
      }
      return "No bio available.";
    },
    profileImage() {
      if (this.currentUser && this.currentUser.profileImage) {
        return this.currentUser.profileImage;
      }
      return require("@/assets/img/faces/marc.jpg");
    },
    isCurrentUser() {
      return true; // Always true since we're showing current user's profile
    },
  },
  mounted() {
    // Listen for storage changes to update the card
    window.addEventListener("storage", this.refresh);
    // Also check periodically (for same-tab updates)
    this.interval = setInterval(() => {
      this.refreshKey++;
    }, 500);
  },
  beforeDestroy() {
    window.removeEventListener("storage", this.refresh);
    if (this.interval) {
      clearInterval(this.interval);
    }
  },
  methods: {
    refresh() {
      this.refreshKey++;
    },
  },
};
</script>
<style></style>
