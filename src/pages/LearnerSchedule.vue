<template>
  <div class="content">
    <div class="md-layout md-gutter">
      <!-- Calendar Panel -->
      <div class="md-layout-item md-medium-size-100 md-size-50">
        <md-card>
          <md-card-header data-background-color="blue">
            <h4 class="title">Calendar</h4>
          </md-card-header>
          <md-card-content>
            <div class="calendar-container">
              <div class="calendar-header">
                <md-button class="md-icon-button" @click="previousMonth">
                  <md-icon>chevron_left</md-icon>
                </md-button>
                <h5 class="month-year">{{ currentMonthYear }}</h5>
                <md-button class="md-icon-button" @click="nextMonth">
                  <md-icon>chevron_right</md-icon>
                </md-button>
              </div>
              <div class="calendar-weekdays">
                <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
              </div>
              <div class="calendar-days">
                <div
                  v-for="(day, index) in calendarDays"
                  :key="index"
                  :class="[
                    'calendar-day',
                    {
                      'other-month': day.otherMonth,
                      'selected': isSelectedDate(day.date),
                      'has-session': hasSessionOnDate(day.date),
                    },
                  ]"
                  @click="selectDate(day.date)"
                >
                  {{ day.day }}
                </div>
              </div>
            </div>
          </md-card-content>
        </md-card>
      </div>

      <!-- Sessions Panel -->
      <div class="md-layout-item md-medium-size-100 md-size-50">
        <md-card>
          <md-card-header data-background-color="green">
            <h4 class="title">Sessions on {{ formatSelectedDate }}</h4>
          </md-card-header>
          <md-card-content>
            <div v-if="selectedDateSessions.length === 0" class="md-body-1">
              No sessions scheduled for this date.
            </div>
            <div v-else>
              <md-card
                v-for="session in selectedDateSessions"
                :key="session.id"
                style="margin-bottom: 16px"
              >
                <md-card-content>
                  <div style="position: relative">
                    <span class="status-badge scheduled">scheduled</span>
                    <h5 style="margin: 0 0 8px 0">{{ session.subject }}</h5>
                    <p style="margin: 4px 0; color: #666">
                      with {{ session.tutorName }}
                    </p>
                    <p style="margin: 4px 0; color: #666">
                      {{ formatDateTime(session.dateTime) }}
                    </p>
                    <div style="margin-top: 16px; display: flex; gap: 8px">
                      <md-button
                        class="md-default"
                        @click="rescheduleSession(session)"
                      >
                        Reschedule
                      </md-button>
                      <md-button
                        class="md-primary md-raised"
                        @click="joinSession(session)"
                      >
                        Join Session
                      </md-button>
                    </div>
                  </div>
                </md-card-content>
              </md-card>
            </div>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentUser, getAcceptedRequestsForLearner } from "@/helpers/storage";

export default {
  name: "LearnerSchedule",
  data() {
    const today = new Date();
    return {
      selectedDate: today,
      currentMonth: today.getMonth(),
      currentYear: today.getFullYear(),
      sessions: [],
      weekDays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    };
  },
  computed: {
    currentMonthYear() {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${monthNames[this.currentMonth]} ${this.currentYear}`;
    },
    calendarDays() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days = [];

      // Previous month's days
      const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({
          day: prevMonthLastDay - i,
          date: new Date(this.currentYear, this.currentMonth - 1, prevMonthLastDay - i),
          otherMonth: true,
        });
      }

      // Current month's days
      for (let day = 1; day <= daysInMonth; day++) {
        days.push({
          day,
          date: new Date(this.currentYear, this.currentMonth, day),
          otherMonth: false,
        });
      }

      // Next month's days to fill the grid
      const remainingDays = 42 - days.length; // 6 rows * 7 days
      for (let day = 1; day <= remainingDays; day++) {
        days.push({
          day,
          date: new Date(this.currentYear, this.currentMonth + 1, day),
          otherMonth: true,
        });
      }

      return days;
    },
    selectedDateSessions() {
      if (!this.selectedDate) {
        return [];
      }
      const selected = new Date(this.selectedDate);
      selected.setHours(0, 0, 0, 0);

      return this.sessions.filter((session) => {
        const sessionDate = new Date(session.dateTime);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === selected.getTime();
      });
    },
    formatSelectedDate() {
      if (!this.selectedDate) {
        return "";
      }
      const date = new Date(this.selectedDate);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    },
  },
  created() {
    this.loadSessions();
  },
  mounted() {
    this.loadSessions();
  },
  watch: {
    $route() {
      this.loadSessions();
    },
  },
  activated() {
    // Refresh when component is activated (e.g., when navigating back to this page)
    this.loadSessions();
  },
  methods: {
    loadSessions() {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return;
      }

      // Get all accepted requests for this learner
      const acceptedRequests = getAcceptedRequestsForLearner(currentUser.id);
      
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
          tutorName: request.tutorName,
          tutorId: request.tutorId,
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
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} • ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    },
    previousMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    },
    selectDate(date) {
      this.selectedDate = date;
    },
    isSelectedDate(date) {
      if (!this.selectedDate || !date) {
        return false;
      }
      const selected = new Date(this.selectedDate);
      const check = new Date(date);
      return (
        selected.getDate() === check.getDate() &&
        selected.getMonth() === check.getMonth() &&
        selected.getFullYear() === check.getFullYear()
      );
    },
    hasSessionOnDate(date) {
      if (!date) {
        return false;
      }
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);

      return this.sessions.some((session) => {
        const sessionDate = new Date(session.dateTime);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === checkDate.getTime();
      });
    },
    rescheduleSession(session) {
      this.$notify({
        message: `Reschedule feature for ${session.subject} with ${session.tutorName}`,
        icon: "info",
        horizontalAlign: "right",
        verticalAlign: "top",
        type: "info",
      });
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
  },
};
</script>

<style scoped>
.calendar-container {
  padding: 16px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.month-year {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-weight: 500;
  font-size: 12px;
  color: #666;
  padding: 8px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.calendar-day:hover {
  background-color: #f0f0f0;
}

.calendar-day.other-month {
  color: #ccc;
}

.calendar-day.selected {
  background-color: #e0e0e0;
  font-weight: 600;
}

.calendar-day.has-session {
  position: relative;
}

.calendar-day.has-session:not(.selected)::after {
  content: "";
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background-color: #9c27b0;
  border-radius: 50%;
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

