<template>
  <md-toolbar md-elevation="0" class="md-transparent">
    <div class="md-toolbar-row">
      <div class="md-toolbar-section-start">
        <h3 class="md-title">{{ $route.name }}</h3>
        <span v-if="welcomeMessage" class="welcome-message">{{ welcomeMessage }}</span>
      </div>
      <div class="md-toolbar-section-end">
        <md-button
          class="md-just-icon md-simple md-toolbar-toggle"
          :class="{ toggled: $sidebar.showSidebar }"
          @click="toggleSidebar"
        >
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </md-button>

        <div class="md-collapse">
          <div class="md-autocomplete">
            <md-autocomplete
              class="search"
              v-model="selectedEmployee"
              :md-options="employees"
            >
              <label>Search...</label>
            </md-autocomplete>
          </div>
          <md-list>
            <md-list-item href="#/">
              <i class="material-icons">dashboard</i>
              <p class="hidden-lg hidden-md">Dashboard</p>
            </md-list-item>

            <!-- <md-list-item href="#/notifications" class="dropdown">
              <drop-down>
                <a slot="title" class="dropdown-toggle" data-toggle="dropdown">
                  <i class="material-icons">notifications</i>
                  <span class="notification">5</span>
                  <p class="hidden-lg hidden-md">Notifications</p>
                </a>
                <ul class="dropdown-menu dropdown-menu-right">
                  <li><a href="#">Mike John responded to your email</a></li>
                  <li><a href="#">You have 5 new tasks</a></li>
                  <li><a href="#">You're now friend with Andrew</a></li>
                  <li><a href="#">Another Notification</a></li>
                  <li><a href="#">Another One</a></li>
                </ul>
              </drop-down>
            </md-list-item> -->

            <li class="md-list-item">
              <drop-down>
                <a
                  slot="title"
                  href="javascript:void(0)"
                  class="md-list-item-router md-list-item-container md-button-clean dropdown-toggle"
                  data-toggle="dropdown"
                  style="position: relative; display: flex; align-items: center; padding: 0 15px; cursor: pointer;"
                >
                  <div class="md-list-item-content" style="display: flex; align-items: center;">
                    <md-icon style="color: #666;">notifications</md-icon>
                    <span v-if="notificationCount > 0" class="notification">{{ notificationCount }}</span>
                    <p class="hidden-lg hidden-md" style="margin: 0 0 0 8px;">Notifications</p>
                  </div>
                </a>
                <ul class="dropdown-menu dropdown-menu-right notification-menu" @click.stop>
                  <li v-if="notifications.length === 0" class="no-notifications">
                    <a href="#" @click.prevent>No new notifications</a>
                  </li>
                  <li
                    v-for="(notification, index) in notifications"
                    :key="index"
                    @click.stop="handleNotificationClick(notification)"
                  >
                    <a href="#" @click.prevent>
                      <md-icon class="notification-icon">{{ notification.icon }}</md-icon>
                      <span class="notification-text">{{ notification.text }}</span>
                      <span class="notification-time">{{ notification.time }}</span>
                    </a>
                  </li>
                </ul>
              </drop-down>
            </li>

            <md-list-item href="#/user">
              <i class="material-icons">person</i>
              <p class="hidden-lg hidden-md">Profile</p>
            </md-list-item>
          </md-list>
        </div>
      </div>
    </div>
  </md-toolbar>
</template>

<script>
import {
  getCurrentUser,
  getPendingTutors,
  getAcceptedRequests,
  getAcceptedRequestsForLearner,
  getMessages,
  getLearnerMessages,
  getAdminMessages,
} from "@/helpers/storage";

export default {
  data() {
    return {
      selectedEmployee: null,
      employees: [
        "Jim Halpert",
        "Dwight Schrute",
        "Michael Scott",
        "Pam Beesly",
        "Angela Martin",
        "Kelly Kapoor",
        "Ryan Howard",
        "Kevin Malone",
      ],
      notifications: [],
      refreshInterval: null,
    };
  },
  computed: {
    welcomeMessage() {
      const user = getCurrentUser();
      if (user) {
        return `Welcome back, ${user.name}`;
      }
      return "";
    },
    notificationCount() {
      return this.notifications.length;
    },
  },
  created() {
    this.loadNotifications();
    // Refresh notifications every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadNotifications();
    }, 30000);
  },
  beforeDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  watch: {
    $route() {
      // Reload notifications when route changes
      this.loadNotifications();
    },
  },
  methods: {
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    loadNotifications() {
      const user = getCurrentUser();
      if (!user) {
        this.notifications = [];
        return;
      }

      const notifications = [];

      if (user.role === "admin") {
        // Admin notifications: Pending tutor approvals
        const pendingTutors = getPendingTutors();
        if (pendingTutors.length > 0) {
          // Get the most recent pending tutor
          const mostRecent = pendingTutors.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.id);
            const dateB = new Date(b.createdAt || b.id);
            return dateB - dateA;
          })[0];
          notifications.push({
            type: "tutor_approval",
            icon: "assignment",
            text: `${pendingTutors.length} tutor${pendingTutors.length > 1 ? "s" : ""} waiting for approval`,
            time: this.formatNotificationTime(mostRecent.createdAt || mostRecent.id),
            route: "/admin/approvals",
          });
        }

        // Admin messages from users
        const adminMessages = getAdminMessages();
        if (adminMessages.length > 0) {
          notifications.push({
            type: "admin_message",
            icon: "message",
            text: `${adminMessages.length} message${adminMessages.length > 1 ? "s" : ""} from users`,
            time: this.formatNotificationTime(adminMessages[adminMessages.length - 1]?.timestamp),
            route: "/admin/messages",
          });
        }
      } else if (user.role === "tutor" && user.status === "approved") {
        // Tutor notifications: Pending requests
        if (typeof window !== "undefined") {
          try {
            const raw = window.localStorage.getItem("app_tutor_requests");
            if (raw) {
              const allRequests = JSON.parse(raw);
              const pendingRequests = allRequests.filter(
                (r) => r.tutorId === user.id && r.status === "pending"
              );
              if (pendingRequests.length > 0) {
                // Get the most recent pending request
                const mostRecent = pendingRequests.sort((a, b) => {
                  const dateA = new Date(a.date || a.id);
                  const dateB = new Date(b.date || b.id);
                  return dateB - dateA;
                })[0];
                notifications.push({
                  type: "pending_request",
                  icon: "description",
                  text: `${pendingRequests.length} new session request${pendingRequests.length > 1 ? "s" : ""}`,
                  time: this.formatNotificationTime(mostRecent.date || mostRecent.id),
                  route: "/tutor-requests",
                });
              }
            }
          } catch (e) {
            console.error("Failed to load tutor requests", e);
          }
        }

        // Tutor: Messages from students
        const acceptedRequests = getAcceptedRequests(user.id);
        if (acceptedRequests.length > 0) {
          const messages = getMessages(user.id);
          // Filter messages where tutor is the receiver (sent by students)
          const receivedMessages = messages.filter(
            (m) => m.tutorId === user.id && m.senderId !== user.id
          );
          if (receivedMessages.length > 0) {
            // Get unique students who sent messages
            const uniqueStudents = new Set(
              receivedMessages.map((m) => m.studentId || m.studentName)
            );
            notifications.push({
              type: "new_message",
              icon: "chat",
              text: `${receivedMessages.length} message${receivedMessages.length > 1 ? "s" : ""} from ${uniqueStudents.size} student${uniqueStudents.size > 1 ? "s" : ""}`,
              time: this.formatNotificationTime(receivedMessages[receivedMessages.length - 1]?.timestamp),
              route: "/tutor-messages",
            });
          }
        }
      } else if (user.role === "user") {
        // Learner notifications: Pending requests
        if (typeof window !== "undefined") {
          try {
            const raw = window.localStorage.getItem("app_learner_requests");
            if (raw) {
              const allRequests = JSON.parse(raw);
              const pendingRequests = allRequests.filter(
                (r) => r.studentId === user.id && r.status === "pending"
              );
              if (pendingRequests.length > 0) {
                // Get the most recent pending request
                const mostRecent = pendingRequests.sort((a, b) => {
                  const dateA = new Date(a.date || a.id);
                  const dateB = new Date(b.date || b.id);
                  return dateB - dateA;
                })[0];
                notifications.push({
                  type: "pending_request",
                  icon: "description",
                  text: `${pendingRequests.length} request${pendingRequests.length > 1 ? "s" : ""} pending`,
                  time: this.formatNotificationTime(mostRecent.date || mostRecent.id),
                  route: "/learner-requests",
                });
              }
            }
          } catch (e) {
            console.error("Failed to load learner requests", e);
          }
        }

        // Learner: Accepted requests (upcoming sessions)
        const acceptedRequests = getAcceptedRequestsForLearner(user.id);
        const upcomingSessions = acceptedRequests.filter((request) => {
          if (!request.preferredDate) return false;
          const dateStr = request.preferredDate;
          const timeStr = request.preferredTime || "14:00";
          const sessionDate = new Date(`${dateStr}T${timeStr}`);
          return sessionDate > new Date() && sessionDate <= new Date(Date.now() + 24 * 60 * 60 * 1000); // Next 24 hours
        });
        if (upcomingSessions.length > 0) {
          // Get the next upcoming session
          const nextSession = upcomingSessions.sort((a, b) => {
            const dateA = new Date(`${a.preferredDate}T${a.preferredTime || "14:00"}`);
            const dateB = new Date(`${b.preferredDate}T${b.preferredTime || "14:00"}`);
            return dateA - dateB;
          })[0];
          const sessionDate = new Date(`${nextSession.preferredDate}T${nextSession.preferredTime || "14:00"}`);
          notifications.push({
            type: "upcoming_session",
            icon: "event",
            text: `${upcomingSessions.length} upcoming session${upcomingSessions.length > 1 ? "s" : ""} today`,
            time: this.formatNotificationTime(sessionDate.toISOString()),
            route: "/learner-schedule",
          });
        }

        // Learner: Messages from tutors
        const learnerMessages = getLearnerMessages(user.id);
        // Filter messages where learner is the receiver (sent by tutors)
        const receivedMessages = learnerMessages.filter(
          (m) => (m.studentId === user.id || m.studentName === user.name) && m.senderId !== user.id
        );
        if (receivedMessages.length > 0) {
          // Get unique tutors who sent messages
          const uniqueTutors = new Set(receivedMessages.map((m) => m.tutorId));
          notifications.push({
            type: "new_message",
            icon: "chat",
            text: `${receivedMessages.length} message${receivedMessages.length > 1 ? "s" : ""} from ${uniqueTutors.size} tutor${uniqueTutors.size > 1 ? "s" : ""}`,
            time: this.formatNotificationTime(receivedMessages[receivedMessages.length - 1]?.timestamp),
            route: "/learner-messages",
          });
        }
      }

      this.notifications = notifications;
    },
    handleNotificationClick(notification) {
      if (notification.route) {
        this.$router.push(notification.route);
      }
    },
    formatNotificationTime(timestamp) {
      if (!timestamp) return "Just now";
      const now = new Date();
      const time = new Date(timestamp);
      const diffMs = now - time;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return time.toLocaleDateString();
    },
  },
};
</script>

<style lang="css">
.welcome-message {
  margin-left: 16px;
  color: #666;
  font-size: 14px;
}

.notification-dropdown {
  position: relative;
}

.dropdown {
  position: relative;
}

.dropdown.open .dropdown-menu {
  display: block;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  min-width: 300px;
  max-width: 400px;
  max-height: 400px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  padding: 0;
  list-style: none;
}

.notification-menu {
  min-width: 300px;
  max-width: 400px;
  max-height: 400px;
  overflow-y: auto;
}

.notification-menu li {
  border-bottom: 1px solid #eee;
}

.notification-menu li:last-child {
  border-bottom: none;
}

.notification-menu li a {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  color: #333;
  transition: background-color 0.2s;
}

.notification-menu li a:hover {
  background-color: #f5f5f5;
}

.notification-icon {
  margin-right: 12px;
  color: #9c27b0;
  font-size: 20px;
}

.notification-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.no-notifications {
  padding: 16px;
  text-align: center;
  color: #999;
}

.no-notifications a {
  cursor: default;
}

.no-notifications a:hover {
  background-color: transparent;
}
</style>
