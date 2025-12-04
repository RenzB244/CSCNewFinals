<template>
  <form @submit.prevent="updateProfile">
    <md-card>
      <md-card-header :data-background-color="dataBackgroundColor">
        <h4 class="title">Edit Profile</h4>
        <p class="category">Complete your profile</p>
      </md-card-header>

      <md-card-content>
        <div class="md-layout">
          <div class="md-layout-item md-small-size-100 md-size-33">
            <md-field>
              <label>Role</label>
              <md-input :value="userRole" disabled></md-input>
            </md-field>
          </div>
          <div class="md-layout-item md-small-size-100 md-size-33">
            <md-field>
              <label>User Name</label>
              <md-input v-model="username" type="text" required></md-input>
            </md-field>
          </div>
          <div class="md-layout-item md-small-size-100 md-size-33">
            <md-field>
              <label>Email Address</label>
              <md-input v-model="emailadress" type="email" required></md-input>
            </md-field>
          </div>
          <div class="md-layout-item md-small-size-100 md-size-50">
            <md-field>
              <label>First Name</label>
              <md-input v-model="firstname" type="text"></md-input>
            </md-field>
          </div>
          <div class="md-layout-item md-small-size-100 md-size-50">
            <md-field>
              <label>Last Name</label>
              <md-input v-model="lastname" type="text"></md-input>
            </md-field>
          </div>
          <div class="md-layout-item md-small-size-100 md-size-100">
            <md-field>
              <label>Address</label>
              <md-input v-model="address" type="text"></md-input>
            </md-field>
          </div>
          <div class="md-layout-item md-small-size-100 md-size-33">
            <md-field>
              <label>City</label>
              <md-input v-model="city" type="text"></md-input>
            </md-field>
          </div>
          <div class="md-layout-item md-small-size-100 md-size-33">
            <md-field>
              <label>Country</label>
              <md-input v-model="country" type="text"></md-input>
            </md-field>
          </div>
          <div class="md-layout-item md-small-size-100 md-size-33">
            <md-field>
              <label>Postal Code</label>
              <md-input v-model="code" type="text"></md-input>
            </md-field>
          </div>
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>About Me</label>
              <md-textarea v-model="aboutme"></md-textarea>
            </md-field>
          </div>
          <div v-if="isTutor" class="md-layout-item md-size-100">
            <md-field>
              <label>Subjects Offered (comma separated)</label>
              <md-input v-model="subjects" type="text"></md-input>
            </md-field>
          </div>
          <div v-if="isTutor" class="md-layout-item md-size-100">
            <md-field>
              <label>Tutor Bio</label>
              <md-textarea v-model="tutorBio"></md-textarea>
            </md-field>
          </div>
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                style="display: none"
                ref="fileInput"
              />
              <div style="display: flex; align-items: center; gap: 16px">
                <md-button
                  class="md-primary"
                  @click="$refs.fileInput.click()"
                >
                  Choose Image
                </md-button>
                <span v-if="profileImagePreview" class="md-caption">
                  Image selected
                </span>
              </div>
              <div v-if="profileImagePreview" style="margin-top: 16px">
                <img
                  :src="profileImagePreview"
                  alt="Profile preview"
                  style="max-width: 200px; max-height: 200px; border-radius: 50%; object-fit: cover;"
                />
              </div>
            </md-field>
          </div>
          <div class="md-layout-item md-size-100 text-right">
            <md-button type="submit" class="md-raised md-success" :disabled="loading">
              {{ loading ? "Updating..." : "Update Profile" }}
            </md-button>
          </div>
        </div>
      </md-card-content>
    </md-card>
  </form>
</template>
<script>
import { getCurrentUser, updateTutorProfile, getUsers, saveUsers, setCurrentUser } from "@/helpers/storage";

export default {
  name: "edit-profile-form",
  props: {
    dataBackgroundColor: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      username: "",
      emailadress: "",
      lastname: "",
      firstname: "",
      address: "",
      city: "",
      country: "",
      code: "",
      aboutme: "",
      subjects: "",
      tutorBio: "",
      profileImage: null,
      profileImagePreview: null,
      loading: false,
    };
  },
  computed: {
    currentUser() {
      return getCurrentUser();
    },
    isTutor() {
      return this.currentUser && this.currentUser.role === "tutor";
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
  },
  created() {
    this.loadProfile();
  },
  methods: {
    loadProfile() {
      const user = getCurrentUser();
      if (user) {
        // Split name into first and last name if possible
        const nameParts = (user.name || "").split(" ");
        this.firstname = nameParts[0] || "";
        this.lastname = nameParts.slice(1).join(" ") || "";
        this.username = user.name || "";
        this.emailadress = user.email || "";
        this.address = user.address || "";
        this.city = user.city || "";
        this.country = user.country || "";
        this.code = user.postalCode || user.code || "";
        this.aboutme = user.aboutme || user.bio || "";
        this.subjects = user.subjects || "";
        this.tutorBio = user.bio || "";
        this.profileImage = user.profileImage || null;
        this.profileImagePreview = user.profileImage || null;
      }
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          this.$notify({
            message: "Image size must be less than 5MB.",
            icon: "error",
            horizontalAlign: "right",
            verticalAlign: "top",
            type: "danger",
          });
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          this.profileImage = e.target.result;
          this.profileImagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    async updateProfile() {
      this.loading = true;
      try {
        const user = getCurrentUser();
        if (!user) {
          throw new Error("No user logged in");
        }

        // Combine first and last name
        const fullName = [this.firstname, this.lastname].filter(Boolean).join(" ") || this.username;

        // Update user in storage
        const users = getUsers();
        const userIndex = users.findIndex((u) => u.id === user.id);
        if (userIndex === -1) {
          throw new Error("User not found");
        }

        const updatedUser = {
          ...users[userIndex],
          name: fullName,
          email: this.emailadress,
          address: this.address,
          city: this.city,
          country: this.country,
          postalCode: this.code,
          code: this.code,
          aboutme: this.aboutme,
        };

        // Update profile image if changed
        if (this.profileImage) {
          updatedUser.profileImage = this.profileImage;
        }

        // If tutor, update tutor-specific fields
        if (this.isTutor) {
          updatedUser.subjects = this.subjects;
          updatedUser.bio = this.tutorBio;
          updatedUser.tutorBio = this.tutorBio; // Also save as tutorBio for UserCard
        }

        users[userIndex] = updatedUser;
        saveUsers(users);
        setCurrentUser(updatedUser);

        // Also update tutor profile if tutor
        if (this.isTutor) {
          updateTutorProfile(user.id, {
            subjects: this.subjects,
            bio: this.tutorBio,
          });
        }

        this.$notify({
          message: "Profile updated successfully.",
          icon: "check",
          horizontalAlign: "right",
          verticalAlign: "top",
          type: "success",
        });

        // Reload profile to reflect changes
        this.loadProfile();
      } catch (error) {
        this.$notify({
          message: error.message || "Failed to update profile.",
          icon: "error",
          horizontalAlign: "right",
          verticalAlign: "top",
          type: "danger",
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
<style></style>
