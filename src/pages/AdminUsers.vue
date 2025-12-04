<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="blue">
            <h4 class="title">The Users</h4>
            <p class="category">Manage all user accounts</p>
          </md-card-header>
          <md-card-content>
            <div v-if="allUsers.length === 0" class="md-body-1">
              No users found.
            </div>
            <div v-else class="table-responsive">
              <table class="md-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in allUsers" :key="user.id">
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span class="md-badge" :class="getRoleBadgeClass(user.role)">
                        {{ user.role }}
                      </span>
                    </td>
                    <td>
                      <span
                        class="md-badge"
                        :class="{
                          'md-success': user.status === 'approved',
                          'md-warning': user.status === 'pending',
                          'md-danger': user.status === 'rejected',
                        }"
                      >
                        {{ user.status || 'n/a' }}
                      </span>
                    </td>
                    <td>
                      <span
                        class="md-badge"
                        :class="{
                          'md-success': user.paymentStatus === 'paid',
                          'md-warning': user.paymentStatus === 'pending',
                          'md-danger': !user.paymentStatus || user.paymentStatus === 'unpaid',
                        }"
                      >
                        {{ user.paymentStatus === 'paid' ? 'Paid' : 'Unpaid' }}
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
import { getUsers, deleteUser } from "@/helpers/storage";

export default {
  name: "AdminUsers",
  data() {
    return {
      allUsers: [],
    };
  },
  created() {
    this.loadUsers();
  },
  methods: {
    loadUsers() {
      this.allUsers = getUsers();
    },
    getRoleBadgeClass(role) {
      return {
        'md-primary': role === 'admin',
        'md-info': role === 'tutor',
        'md-success': role === 'user',
      };
    },
    remove(user) {
      if (
        // eslint-disable-next-line no-restricted-globals
        !confirm(`Delete account for ${user.name} (${user.email})?`)
      ) {
        return;
      }

      deleteUser(user.id);
      this.loadUsers();
      this.$notify({
        message: "Account deleted.",
        icon: "delete",
        horizontalAlign: "right",
        verticalAlign: "top",
        type: "danger",
      });
    },
  },
};
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

