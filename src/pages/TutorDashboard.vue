<template>
  <div class="content">
    <!-- Waiting for Approval Message -->
    <div v-if="!isApproved" class="md-layout" style="margin-bottom: 24px">
      <div class="md-layout-item md-size-100">
        <md-card style="background-color: #ff9800; color: white;">
          <md-card-content style="padding: 24px; text-align: center">
            <md-icon style="font-size: 64px; color: white; margin-bottom: 16px">hourglass_empty</md-icon>
            <h3 style="margin: 0; color: white">Waiting for Admin Approval</h3>
            <p style="margin: 16px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px">
              Your tutor account is pending admin approval. You can only access the home page until your account is approved.
            </p>
            <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px">
              Once approved, you will have access to all features including Requests, Schedule, Messages, and Feedback.
            </p>
          </md-card-content>
        </md-card>
      </div>
    </div>

    <!-- Welcome Section -->
    <div class="md-layout" style="margin-bottom: 24px">
      <div class="md-layout-item md-size-100">
        <h3 class="title">Welcome back, {{ tutorName }}</h3>
        <p class="category" style="color: #666; margin-top: 4px">
          {{ todayDate }}
        </p>
      </div>
    </div>

    <!-- Section 1: Next Upcoming Session -->
    <div v-if="isApproved" class="md-layout" style="margin-bottom: 24px">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="blue">
            <h4 class="title">Next Upcoming Session</h4>
          </md-card-header>
          <md-card-content>
            <div v-if="nextSession">
              <h5 style="margin: 0">{{ nextSession.subject }}</h5>
              <p style="margin: 8px 0; color: #666">
                with {{ nextSession.studentName }}
              </p>
              <p style="margin: 4px 0; color: #666; font-size: 14px">
                <md-icon style="font-size: 16px; vertical-align: middle">event</md-icon>
                {{ formatDateTime(nextSession.dateTime) }}
              </p>
            </div>
            <div v-else class="md-body-1" style="color: #999">
              No upcoming sessions scheduled.
            </div>
          </md-card-content>
        </md-card>
      </div>
    </div>

    <!-- Section 2: Quick Shortcuts -->
    <div v-if="isApproved" class="md-layout md-gutter" style="margin-bottom: 24px">
      <div class="md-layout-item md-medium-size-100 md-size-33">
        <md-card class="clickable-card" @click.native="goToRequests">
          <md-card-content style="text-align: center; padding: 24px; cursor: pointer">
            <md-icon style="font-size: 48px; color: #9c27b0; margin-bottom: 8px">
              assignment
            </md-icon>
            <h5 style="margin: 8px 0">Student Requests</h5>
            <p style="color: #666; font-size: 14px">View pending requests</p>
          </md-card-content>
        </md-card>
      </div>
      <div class="md-layout-item md-medium-size-100 md-size-33">
        <md-card class="clickable-card" @click.native="goToMessages">
          <md-card-content style="text-align: center; padding: 24px; cursor: pointer">
            <md-icon style="font-size: 48px; color: #4caf50; margin-bottom: 8px">
              message
            </md-icon>
            <h5 style="margin: 8px 0">Messages</h5>
            <p style="color: #666; font-size: 14px">Chat with students</p>
          </md-card-content>
        </md-card>
      </div>
      <div class="md-layout-item md-medium-size-100 md-size-33">
        <md-card class="clickable-card" @click.native="goToProfile">
          <md-card-content style="text-align: center; padding: 24px; cursor: pointer">
            <md-icon style="font-size: 48px; color: #ff9800; margin-bottom: 8px">
              edit
            </md-icon>
            <h5 style="margin: 8px 0">Edit Profile</h5>
            <p style="color: #666; font-size: 14px">Update your information</p>
          </md-card-content>
        </md-card>
      </div>
    </div>

    <!-- Section 3: Small Stats -->
    <div v-if="isApproved" class="md-layout md-gutter" style="margin-bottom: 24px">
      <div class="md-layout-item md-medium-size-100 md-size-33">
        <md-card>
          <md-card-content style="text-align: center; padding: 24px">
            <h3 class="title" style="margin: 0; font-size: 36px; color: #ff9800">
              {{ stats.pendingRequests }}
            </h3>
            <p style="margin: 8px 0; color: #666">Pending requests</p>
          </md-card-content>
        </md-card>
      </div>
      <div class="md-layout-item md-medium-size-100 md-size-33">
        <md-card>
          <md-card-content style="text-align: center; padding: 24px">
            <h3 class="title" style="margin: 0; font-size: 36px; color: #4caf50">
              {{ stats.sessionsToday }}
            </h3>
            <p style="margin: 8px 0; color: #666">Sessions today</p>
          </md-card-content>
        </md-card>
      </div>
      <div class="md-layout-item md-medium-size-100 md-size-33">
        <md-card>
          <md-card-content style="text-align: center; padding: 24px">
            <h3 class="title" style="margin: 0; font-size: 36px; color: #2196f3">
              {{ stats.totalStudents }}
            </h3>
            <p style="margin: 8px 0; color: #666">Total students</p>
          </md-card-content>
        </md-card>
      </div>
    </div>

    <!-- Section 4: Announcements -->
    <div v-if="isApproved" class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="orange">
            <h4 class="title">Announcements</h4>
          </md-card-header>
          <md-card-content>
            <div class="announcements-box">
              <div
                v-for="(announcement, index) in announcements"
                :key="index"
                class="announcement-item"
                style="
                  padding: 12px;
                  border-bottom: 1px solid #eee;
                  margin-bottom: 8px;
                "
              >
                <div style="display: flex; align-items: start">
                  <md-icon
                    style="color: #ff9800; margin-right: 12px; margin-top: 4px"
                  >
                    {{ announcement.icon }}
                  </md-icon>
                  <div>
                    <h6 style="margin: 0; margin-bottom: 4px">
                      {{ announcement.title }}
                    </h6>
                    <p style="margin: 0; color: #666; font-size: 14px">
                      {{ announcement.message }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentUser, getAcceptedRequests } from "@/helpers/storage";

export default {
  name: "TutorDashboard",
  data() {
    return {
      tutorName: "",
      todayDate: "",
      nextSession: null,
      stats: {
        pendingRequests: 0,
        sessionsToday: 0,
        totalStudents: 0,
      },
      announcements: [],
    };
  },
  computed: {
    isApproved() {
      const currentUser = getCurrentUser();
      return currentUser && currentUser.status === "approved";
    },
  },
  created() {
    this.loadDashboard();
  },
  methods: {
    loadDashboard() {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return;
      }

      this.tutorName = currentUser.name || "Tutor";
      this.todayDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Only load features if approved
      if (currentUser.status === "approved") {
        this.loadNextSession(currentUser.id);
        this.loadStats(currentUser.id);
        this.loadAnnouncements();
      }
    },
    loadNextSession(tutorId) {
      // Get all accepted requests (sessions)
      const acceptedRequests = getAcceptedRequests(tutorId);

      // Convert to sessions with dateTime
      const sessions = acceptedRequests
        .map((request) => {
          let dateTime;
          if (request.preferredDate && request.preferredDate.trim()) {
            const dateStr = request.preferredDate.trim();
            const timeStr = (request.preferredTime || "14:00").trim();
            
            // Parse date properly - handle YYYY-MM-DD format from date input
            try {
              const [year, month, day] = dateStr.split("-").map(Number);
              const [hours, minutes] = timeStr.split(":").map(Number);
              
              if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                dateTime = new Date(year, month - 1, day, hours || 14, minutes || 0, 0, 0);
              } else {
                throw new Error("Invalid date");
              }
            } catch (e) {
              // Fallback to ISO parsing
              try {
                dateTime = dateStr.includes("T") 
                  ? new Date(dateStr) 
                  : new Date(`${dateStr}T${timeStr}`);
              } catch (e2) {
                dateTime = new Date();
                dateTime.setDate(dateTime.getDate() + 1);
                dateTime.setHours(14, 0, 0, 0);
              }
            }
          } else {
            dateTime = new Date();
            dateTime.setDate(dateTime.getDate() + 1);
            dateTime.setHours(14, 0, 0, 0);
          }

          return {
            id: request.id,
            studentName: request.studentName,
            subject: request.subject,
            dateTime: dateTime,
          };
        })
        .filter((session) => {
          // Only show future sessions
          return new Date(session.dateTime) > new Date();
        })
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

      // Get only the next one
      this.nextSession = sessions.length > 0 ? sessions[0] : null;
    },
    loadStats(tutorId) {
      // Pending requests
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("app_learner_requests");
          if (raw) {
            const allRequests = JSON.parse(raw);
            this.stats.pendingRequests = allRequests.filter(
              (r) => r.tutorId === tutorId && r.status === "pending"
            ).length;
          }
        } catch (e) {
          console.error("Failed to load pending requests", e);
        }
      }

      // Sessions today and total students
      const acceptedRequests = getAcceptedRequests(tutorId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const sessionsToday = acceptedRequests.filter((request) => {
        if (!request.preferredDate) return false;
        const dateStr = request.preferredDate;
        const timeStr = request.preferredTime || "14:00";
        const sessionDate = new Date(`${dateStr}T${timeStr}`);
        return sessionDate >= today && sessionDate < tomorrow;
      });

      this.stats.sessionsToday = sessionsToday.length;

      // Total unique students
      const uniqueStudents = new Set(
        acceptedRequests.map((r) => r.studentId || r.studentName)
      );
      this.stats.totalStudents = uniqueStudents.size;
    },
    loadAnnouncements() {
      // Generate announcements based on current state
      this.announcements = [];

      if (this.stats.pendingRequests > 0) {
        this.announcements.push({
          icon: "notifications",
          title: "New Requests",
          message: `You have ${this.stats.pendingRequests} pending student request${this.stats.pendingRequests > 1 ? "s" : ""} waiting for your response.`,
        });
      }

      if (this.nextSession) {
        const sessionDate = new Date(this.nextSession.dateTime);
        const hoursUntil = (sessionDate - new Date()) / (1000 * 60 * 60);
        if (hoursUntil <= 24 && hoursUntil > 0) {
          this.announcements.push({
            icon: "event",
            title: "Upcoming Session",
            message: `Your next session with ${this.nextSession.studentName} is coming up soon!`,
          });
        }
      }

      if (this.stats.sessionsToday > 0) {
        this.announcements.push({
          icon: "today",
          title: "Sessions Today",
          message: `You have ${this.stats.sessionsToday} session${this.stats.sessionsToday > 1 ? "s" : ""} scheduled for today.`,
        });
      }

      // Default announcement if none
      if (this.announcements.length === 0) {
        this.announcements.push({
          icon: "info",
          title: "Welcome!",
          message: "Keep up the great work! Check your requests and messages regularly.",
        });
      }
    },
    formatDateTime(dateTime) {
      const date = new Date(dateTime);
      return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    },
    goToRequests() {
      this.$router.push("/tutor-requests");
    },
    goToMessages() {
      this.$router.push("/tutor-messages");
    },
    goToProfile() {
      this.$router.push("/user");
    },
  },
  watch: {
    stats: {
      handler() {
        this.loadAnnouncements();
      },
      deep: true,
    },
    nextSession() {
      this.loadAnnouncements();
    },
  },
};
</script>

<style scoped>
.announcements-box {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
}

.announcement-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.clickable-card {
  transition: transform 0.2s;
  cursor: pointer;
}

.clickable-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.clickable-card * {
  pointer-events: none;
}
</style>
