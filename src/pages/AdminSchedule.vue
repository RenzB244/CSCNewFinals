<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="orange">
            <h4 class="title">Schedule</h4>
            <p class="category">View all scheduled sessions</p>
          </md-card-header>
          <md-card-content>
            <div class="md-layout md-gutter" style="margin-bottom: 24px">
              <div class="md-layout-item md-size-100">
                <md-field>
                  <label>Filter by period</label>
                  <md-select v-model="filterPeriod" @change="filterSessions">
                    <md-option value="all">All Sessions</md-option>
                    <md-option value="today">Today</md-option>
                    <md-option value="week">This Week</md-option>
                    <md-option value="month">This Month</md-option>
                  </md-select>
                </md-field>
              </div>
            </div>

            <div v-if="filteredSessions.length === 0" class="md-body-1">
              No sessions found for the selected period.
            </div>
            <div v-else class="table-responsive">
              <table class="md-table">
                <thead>
                  <tr>
                    <th>Tutor</th>
                    <th>Student</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="session in filteredSessions" :key="session.id">
                    <td>{{ session.tutorName }}</td>
                    <td>{{ session.studentName }}</td>
                    <td>{{ session.subject }}</td>
                    <td>{{ formatDate(session.dateTime) }}</td>
                    <td>{{ formatTime(session.dateTime) }}</td>
                    <td>
                      <span class="md-badge md-success">Scheduled</span>
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
import { getAllSessions } from "@/helpers/storage";

export default {
  name: "AdminSchedule",
  data() {
    return {
      allSessions: [],
      filterPeriod: "all",
      filteredSessions: [],
    };
  },
  created() {
    this.loadSessions();
  },
  methods: {
    loadSessions() {
      this.allSessions = getAllSessions();
      this.filterSessions();
    },
    filterSessions() {
      if (this.filterPeriod === "all") {
        this.filteredSessions = this.allSessions;
        return;
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      this.filteredSessions = this.allSessions.filter((session) => {
        const sessionDate = new Date(session.dateTime);
        if (this.filterPeriod === "today") {
          return sessionDate >= today && sessionDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        } else if (this.filterPeriod === "week") {
          return sessionDate >= weekStart;
        } else if (this.filterPeriod === "month") {
          return sessionDate >= monthStart;
        }
        return true;
      });
    },
    formatDate(dateTime) {
      return new Date(dateTime).toLocaleDateString();
    },
    formatTime(dateTime) {
      return new Date(dateTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
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

