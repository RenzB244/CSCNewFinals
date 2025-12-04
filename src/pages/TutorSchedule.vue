<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="blue">
            <h4 class="title">Schedule</h4>
            <p class="category">Manage your tutoring sessions and availability</p>
          </md-card-header>
          <md-card-content>
            <div class="md-layout md-gutter">
              <div class="md-layout-item md-size-100">
                <md-field>
                  <label>Select Date</label>
                  <md-input
                    type="date"
                    v-model="selectedDate"
                  ></md-input>
                </md-field>
              </div>
            </div>

            <h4 class="section-title">Upcoming Sessions</h4>
            <div v-if="sessions.length === 0" class="md-body-1">
              No scheduled sessions.
            </div>
            <div v-else>
              <md-list>
                <md-list-item
                  v-for="session in sessions"
                  :key="session.id"
                >
                  <md-icon>event</md-icon>
                  <div class="md-list-item-text">
                    <span>{{ session.studentName }}</span>
                    <span>{{ session.subject }} - {{ formatDateTime(session.dateTime) }}</span>
                  </div>
                  <md-button
                    class="md-icon-button md-list-action"
                    @click="viewSession(session)"
                  >
                    <md-icon>info</md-icon>
                  </md-button>
                </md-list-item>
              </md-list>
            </div>

            <h4 class="section-title" style="margin-top: 24px">Set Availability</h4>
            <div class="md-layout md-gutter">
              <div class="md-layout-item md-size-50">
                <md-field>
                  <label>Start Time</label>
                  <md-input type="time" v-model="availability.startTime"></md-input>
                </md-field>
              </div>
              <div class="md-layout-item md-size-50">
                <md-field>
                  <label>End Time</label>
                  <md-input type="time" v-model="availability.endTime"></md-input>
                </md-field>
              </div>
            </div>
            <md-button
              class="md-success"
              @click="saveAvailability"
            >
              Save Availability
            </md-button>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentUser, getAcceptedRequests } from "@/helpers/storage";

export default {
  name: "TutorSchedule",
  data() {
    return {
      selectedDate: new Date().toISOString().split("T")[0],
      sessions: [],
      availability: {
        startTime: "09:00",
        endTime: "17:00",
      },
    };
  },
  created() {
    this.loadSessions();
  },
  mounted() {
    // Refresh sessions when component is mounted
    this.loadSessions();
  },
  watch: {
    // Watch for route changes to refresh sessions
    $route() {
      this.loadSessions();
    },
  },
  methods: {
    loadSessions() {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return;
      }

      // Get all accepted requests for this tutor
      const acceptedRequests = getAcceptedRequests(currentUser.id);
      
      // Convert accepted requests to sessions
      this.sessions = acceptedRequests.map((request) => {
        // Create dateTime from preferred date and time, or use a default future date
        let dateTime;
        if (request.preferredDate) {
          const dateStr = request.preferredDate;
          const timeStr = request.preferredTime || "14:00";
          dateTime = new Date(`${dateStr}T${timeStr}`);
          
          // If the date is in the past, set it to tomorrow at the same time
          if (dateTime < new Date()) {
            dateTime = new Date();
            dateTime.setDate(dateTime.getDate() + 1);
            const [hours, minutes] = timeStr.split(":");
            dateTime.setHours(parseInt(hours) || 14, parseInt(minutes) || 0, 0, 0);
          }
        } else {
          // Default to 2 days from now at 2 PM
          dateTime = new Date();
          dateTime.setDate(dateTime.getDate() + 2);
          dateTime.setHours(14, 0, 0, 0);
        }

        return {
          id: request.id,
          studentName: request.studentName,
          studentId: request.studentId,
          subject: request.subject,
          dateTime: dateTime,
          requestId: request.id,
          notes: request.notes || "",
        };
      });

      // Sort sessions by date
      this.sessions.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    },
    formatDateTime(dateTime) {
      const date = new Date(dateTime);
      return `${date.toLocaleDateString()}, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    },
    viewSession(session) {
      this.$notify({
        message: `Viewing session with ${session.studentName} - ${session.subject}`,
        icon: "info",
        horizontalAlign: "right",
        verticalAlign: "top",
        type: "info",
      });
    },
    saveAvailability() {
      this.$notify({
        message: "Availability saved successfully.",
        icon: "check",
        horizontalAlign: "right",
        verticalAlign: "top",
        type: "success",
      });
    },
  },
};
</script>

<style scoped>
.section-title {
  margin-top: 24px;
  margin-bottom: 8px;
}
</style>

