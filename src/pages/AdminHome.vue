<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="purple">
            <h4 class="title">Admin Dashboard</h4>
            <p class="category">Welcome to the admin panel</p>
          </md-card-header>
          <md-card-content>
            <div class="md-layout md-gutter" style="margin-top: 24px">
              <div class="md-layout-item md-medium-size-100 md-size-25">
                <md-card>
                  <md-card-content style="text-align: center; padding: 24px">
                    <h3 class="title" style="margin: 0; font-size: 36px; color: #2196f3">
                      {{ stats.totalUsers }}
                    </h3>
                    <p style="margin: 8px 0; color: #666">Total Users</p>
                  </md-card-content>
                </md-card>
              </div>
              <div class="md-layout-item md-medium-size-100 md-size-25">
                <md-card>
                  <md-card-content style="text-align: center; padding: 24px">
                    <h3 class="title" style="margin: 0; font-size: 36px; color: #4caf50">
                      {{ stats.totalTutors }}
                    </h3>
                    <p style="margin: 8px 0; color: #666">Total Tutors</p>
                  </md-card-content>
                </md-card>
              </div>
              <div class="md-layout-item md-medium-size-100 md-size-25">
                <md-card>
                  <md-card-content style="text-align: center; padding: 24px">
                    <h3 class="title" style="margin: 0; font-size: 36px; color: #ff9800">
                      {{ stats.pendingTutors }}
                    </h3>
                    <p style="margin: 8px 0; color: #666">Pending Tutors</p>
                  </md-card-content>
                </md-card>
              </div>
              <div class="md-layout-item md-medium-size-100 md-size-25">
                <md-card>
                  <md-card-content style="text-align: center; padding: 24px">
                    <h3 class="title" style="margin: 0; font-size: 36px; color: #9c27b0">
                      ₱{{ stats.totalEarnings }}
                    </h3>
                    <p style="margin: 8px 0; color: #666">Total Earnings</p>
                  </md-card-content>
                </md-card>
              </div>
            </div>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import { getUsers, getPendingTutors } from "@/helpers/storage";
import { getTotalEarnings } from "@/helpers/storage";

export default {
  name: "AdminHome",
  data() {
    return {
      stats: {
        totalUsers: 0,
        totalTutors: 0,
        pendingTutors: 0,
        totalEarnings: 0,
      },
    };
  },
  created() {
    this.loadStats();
  },
  methods: {
    loadStats() {
      const users = getUsers();
      this.stats.totalUsers = users.filter((u) => u.role === "user").length;
      this.stats.totalTutors = users.filter((u) => u.role === "tutor").length;
      this.stats.pendingTutors = getPendingTutors().length;
      this.stats.totalEarnings = getTotalEarnings();
    },
  },
};
</script>

