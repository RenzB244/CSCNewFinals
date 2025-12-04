<template>
  <div class="content">
    <!-- Welcome Section -->
    <div class="md-layout" style="margin-bottom: 24px">
      <div class="md-layout-item md-size-100">
        <h3 class="title">Welcome back, {{ learnerName }}</h3>
        <p class="category" style="color: #666; margin-top: 4px">
          {{ todayDate }}
        </p>
      </div>
    </div>

    <!-- Section 1: Next Upcoming Session -->
    <div class="md-layout" style="margin-bottom: 24px">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="blue">
            <h4 class="title">Next Upcoming Session</h4>
          </md-card-header>
          <md-card-content>
            <div v-if="nextSession">
              <h5 style="margin: 0">{{ nextSession.subject }}</h5>
              <p style="margin: 8px 0; color: #666">
                with {{ nextSession.tutorName }}
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
    <div class="md-layout md-gutter" style="margin-bottom: 24px">
      <div class="md-layout-item md-medium-size-100 md-size-33">
        <md-card class="clickable-card" @click.native="findTutor">
          <md-card-content style="text-align: center; padding: 24px; cursor: pointer">
            <md-icon style="font-size: 48px; color: #2196f3; margin-bottom: 8px">
              search
            </md-icon>
            <h5 style="margin: 8px 0">Find a Tutor</h5>
            <p style="color: #666; font-size: 14px">Browse and request tutors</p>
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
            <p style="color: #666; font-size: 14px">Chat with your tutors</p>
          </md-card-content>
        </md-card>
      </div>
      <div class="md-layout-item md-medium-size-100 md-size-33">
        <md-card class="clickable-card" @click.native="goToProfile">
          <md-card-content style="text-align: center; padding: 24px; cursor: pointer">
            <md-icon style="font-size: 48px; color: #ff9800; margin-bottom: 8px">
              person
            </md-icon>
            <h5 style="margin: 8px 0">My Profile</h5>
            <p style="color: #666; font-size: 14px">View your profile</p>
          </md-card-content>
        </md-card>
      </div>
    </div>

    <!-- Section 3: Small Stats -->
    <div class="md-layout md-gutter" style="margin-bottom: 24px">
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
              {{ stats.totalTutors }}
            </h3>
            <p style="margin: 8px 0; color: #666">Active tutors</p>
          </md-card-content>
        </md-card>
      </div>
    </div>

    <!-- Section 4: Announcements -->
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="green">
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
                    style="color: #4caf50; margin-right: 12px; margin-top: 4px"
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
import { getCurrentUser } from "@/helpers/storage";

export default {
  name: "LearnerDashboard",
  data() {
    return {
      learnerName: "",
      todayDate: "",
      nextSession: null,
      stats: {
        pendingRequests: 0,
        sessionsToday: 0,
        totalTutors: 0,
      },
      announcements: [],
    };
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

      this.learnerName = currentUser.name || "Learner";
      this.todayDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      this.loadNextSession(currentUser.id);
      this.loadStats(currentUser.id);
      this.loadAnnouncements();
    },
    loadNextSession(learnerId) {
      // Get all accepted requests for this learner
      const acceptedRequests = this.getAcceptedRequestsForLearner(learnerId);

      // Convert accepted requests to sessions
      const sessions = acceptedRequests
        .map((request) => {
          let dateTime;
          if (request.preferredDate) {
            const dateStr = request.preferredDate;
            const timeStr = request.preferredTime || "14:00";
            dateTime = new Date(`${dateStr}T${timeStr}`);
          } else {
            dateTime = new Date();
            dateTime.setDate(dateTime.getDate() + 1);
            dateTime.setHours(14, 0, 0, 0);
          }

          return {
            id: request.id,
            tutorName: request.tutorName,
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
    loadStats(learnerId) {
      // Pending requests
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("app_learner_requests");
          if (raw) {
            const allRequests = JSON.parse(raw);
            this.stats.pendingRequests = allRequests.filter(
              (r) => r.studentId === learnerId && r.status === "pending"
            ).length;
          }
        } catch (e) {
          console.error("Failed to load pending requests", e);
        }
      }

      // Sessions today
      const acceptedRequests = this.getAcceptedRequestsForLearner(learnerId);
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

      // Total active tutors (approved tutors)
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("app_users");
          if (raw) {
            const users = JSON.parse(raw);
            this.stats.totalTutors = users.filter(
              (u) => u.role === "tutor" && u.status === "approved"
            ).length;
          }
        } catch (e) {
          console.error("Failed to load tutors", e);
        }
      }
    },
    loadAnnouncements() {
      // Generate announcements based on current state
      this.announcements = [];

      if (this.stats.pendingRequests > 0) {
        this.announcements.push({
          icon: "notifications",
          title: "Pending Requests",
          message: `You have ${this.stats.pendingRequests} pending request${this.stats.pendingRequests > 1 ? "s" : ""} waiting for tutor approval.`,
        });
      }

      if (this.nextSession) {
        const sessionDate = new Date(this.nextSession.dateTime);
        const hoursUntil = (sessionDate - new Date()) / (1000 * 60 * 60);
        if (hoursUntil <= 24 && hoursUntil > 0) {
          this.announcements.push({
            icon: "event",
            title: "Upcoming Session",
            message: `Your next session with ${this.nextSession.tutorName} is coming up soon!`,
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
          message: "Start by finding a tutor that matches your learning needs.",
        });
      }
    },
    getAcceptedRequestsForLearner(learnerId) {
      if (typeof window === "undefined") {
        return [];
      }
      try {
        const raw = window.localStorage.getItem("app_learner_requests");
        if (!raw) {
          return [];
        }
        const allRequests = JSON.parse(raw);
        return allRequests.filter(
          (r) => r.studentId === learnerId && r.status === "accepted"
        );
      } catch (e) {
        return [];
      }
    },
    formatDateTime(dateTime) {
      const date = new Date(dateTime);
      return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    },
    findTutor() {
      this.$router.push("/learner-requests");
    },
    goToMessages() {
      this.$router.push("/learner-messages");
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
