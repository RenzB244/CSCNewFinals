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
import { getCurrentUser } from "@/helpers/storage";

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
  methods: {
    loadSessions() {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return;
      }

      // Get all accepted requests for this learner
      const acceptedRequests = this.getAcceptedRequestsForLearner(currentUser.id);
      
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
          tutorName: request.tutorName,
          tutorId: request.tutorId,
          subject: request.subject,
          dateTime: dateTime,
          requestId: request.id,
          notes: request.notes || "",
        };
      });

      // Sort sessions by date
      this.sessions.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
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
      // Generate or use a Google Meet link
      // For now, we'll use a placeholder Google Meet link
      // In a real app, this would be stored with the session
      const meetLink = session.meetLink || `https://meet.google.com/${this.generateMeetCode()}`;
      window.open(meetLink, "_blank");
    },
    generateMeetCode() {
      // Generate a random meet code (format: abc-defg-hij)
      const chars = "abcdefghijklmnopqrstuvwxyz";
      const parts = [
        Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""),
        Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""),
        Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""),
      ];
      return parts.join("-");
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

