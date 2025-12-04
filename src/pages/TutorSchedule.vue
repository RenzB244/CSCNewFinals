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
              <md-card
                v-for="session in sessions"
                :key="session.id"
                style="margin-bottom: 16px"
              >
                <md-card-content>
                  <div style="position: relative">
                    <span class="status-badge scheduled">scheduled</span>
                    <h5 style="margin: 0 0 8px 0">{{ session.subject }}</h5>
                    <p style="margin: 4px 0; color: #666">
                      with {{ session.studentName }}
                    </p>
                    <p style="margin: 4px 0; color: #666">
                      {{ formatDateTime(session.dateTime) }}
                    </p>
                    <div style="margin-top: 16px; display: flex; gap: 8px">
                      <md-button
                        class="md-primary md-raised"
                        @click="joinSession(session)"
                      >
                        <md-icon>video_call</md-icon>
                        Join Session
                      </md-button>
                    </div>
                  </div>
                </md-card-content>
              </md-card>
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
        if (request.preferredDate && request.preferredDate.trim()) {
          const dateStr = request.preferredDate.trim();
          const timeStr = (request.preferredTime || "14:00").trim();
          
          // Try to parse the date - handle YYYY-MM-DD format from date input
          try {
            // Date input returns YYYY-MM-DD format
            // Parse it properly to avoid timezone issues
            const [year, month, day] = dateStr.split("-").map(Number);
            const [hours, minutes] = timeStr.split(":").map(Number);
            
            // Validate parsed values
            if (isNaN(year) || isNaN(month) || isNaN(day)) {
              throw new Error("Invalid date format");
            }
            
            // Create date in local timezone
            dateTime = new Date(year, month - 1, day, hours || 14, minutes || 0, 0, 0);
            
            // Validate the date
            if (isNaN(dateTime.getTime())) {
              throw new Error("Invalid date");
            }
            
            // Only adjust if the DATE is in the past (not just the time)
            // This allows same-day bookings even if the time has passed
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const sessionDate = new Date(year, month - 1, day);
            
            // Only move to tomorrow if the date itself is in the past (not same day)
            if (sessionDate < today) {
              dateTime = new Date();
              dateTime.setDate(dateTime.getDate() + 1);
              dateTime.setHours(hours || 14, minutes || 0, 0, 0);
            }
          } catch (e) {
            // If parsing fails, try alternative format or default
            try {
              // Try ISO format parsing
              if (dateStr.includes("T")) {
                dateTime = new Date(dateStr);
              } else {
                dateTime = new Date(`${dateStr}T${timeStr}`);
              }
              
              if (isNaN(dateTime.getTime())) {
                throw new Error("Invalid date");
              }
              
              // If the date is in the past, set it to tomorrow at the same time
              if (dateTime < new Date()) {
                dateTime = new Date();
                dateTime.setDate(dateTime.getDate() + 1);
                const [h, m] = timeStr.split(":").map(Number);
                dateTime.setHours(h || 14, m || 0, 0, 0);
              }
            } catch (e2) {
              // If all parsing fails, default to 2 days from now
              dateTime = new Date();
              dateTime.setDate(dateTime.getDate() + 2);
              dateTime.setHours(14, 0, 0, 0);
            }
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
          meetLink: request.meetLink || null, // Include meetLink from request
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
    joinSession(session) {
      // Generate or use the stored Google Meet link
      // The same link should be used for both tutor and learner
      const meetLink = session.meetLink || this.getOrCreateMeetLink(session);
      window.open(meetLink, "_blank");
    },
    getOrCreateMeetLink(session) {
      // Generate a consistent meet link based on session ID
      // This ensures the same session always has the same link
      const meetCode = this.generateMeetCodeFromSessionId(session.id);
      const meetLink = `https://meet.google.com/${meetCode}`;
      
      // Store the meet link with the request so both tutor and learner can access it
      this.saveMeetLinkToRequest(session.id, meetLink);
      
      return meetLink;
    },
    generateMeetCodeFromSessionId(sessionId) {
      // Generate a consistent meet code from session ID
      // This ensures the same session always gets the same code
      const chars = "abcdefghijklmnopqrstuvwxyz";
      // Use session ID as seed for consistent code generation
      let hash = 0;
      for (let i = 0; i < sessionId.length; i++) {
        hash = ((hash << 5) - hash) + sessionId.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      
      // Generate code based on hash
      const parts = [
        Array.from({ length: 3 }, (_, i) => chars[Math.abs(hash + i) % chars.length]).join(""),
        Array.from({ length: 4 }, (_, i) => chars[Math.abs(hash + i + 3) % chars.length]).join(""),
        Array.from({ length: 3 }, (_, i) => chars[Math.abs(hash + i + 7) % chars.length]).join(""),
      ];
      return parts.join("-");
    },
    saveMeetLinkToRequest(requestId, meetLink) {
      // Save meet link to both app_learner_requests and app_accepted_requests
      if (typeof window === "undefined") {
        return;
      }
      try {
        // Update in learner requests
        const learnerRaw = window.localStorage.getItem("app_learner_requests");
        if (learnerRaw) {
          const learnerRequests = JSON.parse(learnerRaw);
          const requestIndex = learnerRequests.findIndex((r) => r.id === requestId);
          if (requestIndex !== -1) {
            learnerRequests[requestIndex].meetLink = meetLink;
            window.localStorage.setItem("app_learner_requests", JSON.stringify(learnerRequests));
          }
        }
        
        // Update in accepted requests
        const acceptedRaw = window.localStorage.getItem("app_accepted_requests");
        if (acceptedRaw) {
          const acceptedRequests = JSON.parse(acceptedRaw);
          const requestIndex = acceptedRequests.findIndex((r) => r.id === requestId);
          if (requestIndex !== -1) {
            acceptedRequests[requestIndex].meetLink = meetLink;
            window.localStorage.setItem("app_accepted_requests", JSON.stringify(acceptedRequests));
          }
        }
      } catch (e) {
        console.error("Failed to save meet link", e);
      }
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

.status-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.scheduled {
  background-color: #4caf50;
  color: white;
}
</style>

