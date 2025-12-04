<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="purple" class="admin-header">
            <div>
              <h4 class="title">Admin Dashboard</h4>
              <p class="category">
                Manage users, tutors, and tutor approval requests
              </p>
            </div>
            <md-button class="md-raised md-default" @click="logout">
              <md-icon>exit_to_app</md-icon>
              Logout
            </md-button>
          </md-card-header>

          <md-card-content>
            <div class="md-layout md-gutter stats-row">
              <div class="md-layout-item md-size-33">
                <h5>Total users</h5>
                <p class="stat-number">{{ userCount }}</p>
              </div>
              <div class="md-layout-item md-size-33">
                <h5>Total tutors</h5>
                <p class="stat-number">{{ tutorCount }}</p>
              </div>
              <div class="md-layout-item md-size-33">
                <h5>Pending tutors</h5>
                <p class="stat-number">{{ pendingTutors.length }}</p>
              </div>
            </div>

            <h4 class="section-title">Pending tutor approvals</h4>
            <div v-if="pendingTutors.length === 0" class="md-body-1">
              No pending tutor applications.
            </div>

            <div v-else class="table-responsive">
              <table class="md-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Credentials</th>
                    <th>Image</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tutor in pendingTutors" :key="tutor.id">
                    <td>{{ tutor.name }}</td>
                    <td>{{ tutor.email }}</td>
                    <td>
                      <span class="md-caption">{{ tutor.credentials }}</span>
                    </td>
                    <td>
                      <div v-if="tutor.credentialImage">
                        <img
                          :src="tutor.credentialImage"
                          alt="Credential"
                          class="credential-thumb"
                        />
                      </div>
                      <span v-else class="md-caption">No image</span>
                    </td>
                    <td>
                      <span class="md-badge md-warning"
                        >{{ tutor.status || "pending" }}</span
                      >
                    </td>
                    <td>
                      <md-button
                        class="md-raised md-success"
                        @click="approve(tutor.id)"
                      >
                        Accept
                      </md-button>
                      <md-button
                        class="md-raised md-danger"
                        @click="reject(tutor.id)"
                      >
                        Reject
                      </md-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 class="section-title">All accounts</h4>
            <div v-if="allUsers.length === 0" class="md-body-1">
              No accounts found.
            </div>
            <div v-else class="table-responsive">
              <table class="md-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in allUsers" :key="user.id">
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.role }}</td>
                    <td>
                      <span
                        class="md-badge"
                        :class="{
                          'md-success': user.status === 'approved',
                          'md-warning': user.status === 'pending',
                        }"
                      >
                        {{ user.status || 'n/a' }}
                      </span>
                    </td>
                    <td>
                      <md-button
                        class="md-raised md-danger"
                        :disabled="user.role === 'admin'"
                        @click="remove(user)"
                      >
                        Delete
                      </md-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getPendingTutors,
  approveTutor,
  getUsers,
  deleteUser,
  rejectTutor,
  logoutUser,
} from "@/helpers/storage";

export default {
  name: "AdminDashboard",
  data() {
    return {
      pendingTutors: [],
      allUsers: [],
      userCount: 0,
      tutorCount: 0,
    };
  },
  created() {
    this.refresh();
  },
  methods: {
    refresh() {
      this.pendingTutors = getPendingTutors();
      this.allUsers = getUsers();
      this.userCount = this.allUsers.filter((u) => u.role === "user").length;
      this.tutorCount = this.allUsers.filter((u) => u.role === "tutor").length;
    },
    approve(id) {
      approveTutor(id);
      this.refresh();
      this.$notify({
        message: "Tutor approved successfully.",
        icon: "check",
        horizontalAlign: "right",
        verticalAlign: "top",
        type: "success",
      });
    },
    remove(user) {
      if (
        // eslint-disable-next-line no-restricted-globals
        !confirm(`Delete account for ${user.name} (${user.email})?`)
      ) {
        return;
      }

      deleteUser(user.id);
      this.refresh();
      this.$notify({
        message: "Account deleted.",
        icon: "delete",
        horizontalAlign: "right",
        verticalAlign: "top",
        type: "danger",
      });
    },
    reject(id) {
      rejectTutor(id);
      this.refresh();
      this.$notify({
        message: "Tutor request rejected.",
        icon: "close",
        horizontalAlign: "right",
        verticalAlign: "top",
        type: "danger",
      });
    },
    logout() {
      logoutUser();
      if (this.$route.path !== "/login") {
        this.$router.push("/login");
      }
    },
  },
};
</script>

<style scoped>
.credential-thumb {
  max-width: 80px;
  max-height: 80px;
  border-radius: 4px;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  margin-top: 4px;
}

.section-title {
  margin-top: 24px;
  margin-bottom: 8px;
}

.table-responsive {
  overflow-x: auto;
}
</style>

