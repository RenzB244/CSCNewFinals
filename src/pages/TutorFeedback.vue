<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="red">
            <h4 class="title">Feedback & Reviews</h4>
            <p class="category">View feedback from your students</p>
          </md-card-header>
          <md-card-content>
            <div class="md-layout md-gutter stats-row">
              <div class="md-layout-item md-size-33">
                <h5>Average Rating</h5>
                <p class="stat-number">{{ averageRating.toFixed(1) }}</p>
                <div>
                  <md-icon
                    v-for="i in 5"
                    :key="i"
                    :style="{
                      color: i <= Math.round(averageRating) ? '#ffc107' : '#ddd',
                    }"
                  >
                    star
                  </md-icon>
                </div>
              </div>
              <div class="md-layout-item md-size-33">
                <h5>Total Reviews</h5>
                <p class="stat-number">{{ reviews.length }}</p>
              </div>
              <div class="md-layout-item md-size-33">
                <h5>Total Sessions</h5>
                <p class="stat-number">{{ totalSessions }}</p>
              </div>
            </div>

            <h4 class="section-title">Rate Your Students</h4>
            <div v-if="completedSessions.length === 0" class="md-body-1">
              No completed sessions yet. Complete a session to rate your students.
            </div>
            <div v-else>
              <md-card
                v-for="session in completedSessions"
                :key="session.id"
                style="margin-bottom: 16px"
              >
                <md-card-content>
                  <div class="md-layout">
                    <div class="md-layout-item md-size-75">
                      <h5 style="margin: 0">{{ session.subject }}</h5>
                      <p style="margin: 4px 0; color: #666">
                        Student: {{ session.studentName }}
                      </p>
                      <p style="margin: 4px 0; color: #666; font-size: 14px">
                        {{ formatDate(session.dateTime) }}
                      </p>
                    </div>
                    <div class="md-layout-item md-size-25 text-right">
                      <md-button
                        v-if="!session.hasRating"
                        class="md-primary md-raised"
                        @click="showRatingDialog(session)"
                      >
                        Rate Student
                      </md-button>
                      <span v-else class="md-caption">Rated</span>
                    </div>
                  </div>
                </md-card-content>
              </md-card>
            </div>

            <h4 class="section-title" style="margin-top: 24px">Recent Reviews from Students</h4>
            <div v-if="reviews.length === 0" class="md-body-1">
              No reviews yet.
            </div>
            <div v-else>
              <md-card
                v-for="review in reviews"
                :key="review.id"
                style="margin-bottom: 16px"
              >
                <md-card-content>
                  <div class="md-layout">
                    <div class="md-layout-item md-size-100">
                      <h5 style="margin: 0">{{ review.studentName }}</h5>
                      <div style="margin: 8px 0">
                        <md-icon
                          v-for="i in 5"
                          :key="i"
                          :style="{
                            color: i <= review.rating ? '#ffc107' : '#ddd',
                            fontSize: '18px',
                          }"
                        >
                          star
                        </md-icon>
                        <span style="margin-left: 8px">{{ formatDate(review.date) }}</span>
                      </div>
                      <p style="margin: 8px 0">{{ review.comment }}</p>
                    </div>
                  </div>
                </md-card-content>
              </md-card>
            </div>
          </md-card-content>
        </md-card>
      </div>
    </div>

    <!-- Rating Dialog -->
    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Rate Your Student</md-dialog-title>
      <md-dialog-content>
        <div class="md-layout md-gutter">
          <div class="md-layout-item md-size-100">
            <p><strong>{{ ratingSession.studentName }}</strong></p>
            <p>{{ ratingSession.subject }}</p>
          </div>
          <div class="md-layout-item md-size-100">
            <label>Rating</label>
            <div style="display: flex; gap: 8px; margin-top: 8px">
              <div
                v-for="i in 5"
                :key="i"
                @click="ratingForm.rating = i"
                style="cursor: pointer; display: inline-block;"
              >
                <md-icon
                  :style="{
                    color: i <= ratingForm.rating ? '#ffc107' : '#ddd',
                    fontSize: '32px',
                  }"
                >
                  star
                </md-icon>
              </div>
            </div>
          </div>
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>Comments (Optional)</label>
              <md-textarea v-model="ratingForm.comment"></md-textarea>
            </md-field>
          </div>
        </div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showDialog = false">Cancel</md-button>
        <md-button class="md-primary" @click="submitRating">Submit Rating</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import { getCurrentUser, getAcceptedRequests } from "@/helpers/storage";

export default {
  name: "TutorFeedback",
  data() {
    return {
      reviews: [],
      completedSessions: [],
      totalSessions: 0,
      showDialog: false,
      ratingSession: {},
      ratingForm: {
        rating: 0,
        comment: "",
      },
    };
  },
  created() {
    this.loadReviews();
    this.loadCompletedSessions();
  },
  computed: {
    averageRating() {
      if (this.reviews.length === 0) return 0;
      const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
      return sum / this.reviews.length;
    },
    currentUser() {
      return getCurrentUser();
    },
  },
  methods: {
    loadReviews() {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return;
      }

      if (typeof window === "undefined") {
        return;
      }
      try {
        const raw = window.localStorage.getItem("app_tutor_reviews");
        if (!raw) {
          this.reviews = [];
          return;
        }
        const allReviews = JSON.parse(raw);
        this.reviews = allReviews.filter(
          (r) => r.tutorId === currentUser.id
        );
      } catch (e) {
        this.reviews = [];
      }
    },
    loadCompletedSessions() {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return;
      }

      // Get all accepted requests (sessions)
      const acceptedRequests = getAcceptedRequests(currentUser.id);
      
      // For now, consider all sessions as completed if they're in the past
      this.completedSessions = acceptedRequests
        .map((request) => {
          let dateTime;
          if (request.preferredDate) {
            const dateStr = request.preferredDate;
            const timeStr = request.preferredTime || "14:00";
            dateTime = new Date(`${dateStr}T${timeStr}`);
          } else {
            dateTime = new Date();
            dateTime.setDate(dateTime.getDate() + 2);
            dateTime.setHours(14, 0, 0, 0);
          }

          return {
            id: request.id,
            subject: request.subject,
            studentName: request.studentName,
            studentId: request.studentId,
            dateTime: dateTime,
            hasRating: this.hasRatingForSession(request.id),
          };
        })
        .filter((session) => {
          // Show sessions that are in the past or today
          return new Date(session.dateTime) <= new Date();
        });

      this.totalSessions = this.completedSessions.length;
    },
    hasRatingForSession(sessionId) {
      const currentUser = getCurrentUser();
      if (!currentUser || typeof window === "undefined") {
        return false;
      }
      try {
        const raw = window.localStorage.getItem("app_tutor_student_ratings");
        if (!raw) {
          return false;
        }
        const ratings = JSON.parse(raw);
        return ratings.some((r) => r.sessionId === sessionId && r.tutorId === currentUser.id);
      } catch (e) {
        return false;
      }
    },
    showRatingDialog(session) {
      this.ratingSession = session;
      this.ratingForm = {
        rating: 0,
        comment: "",
      };
      this.showDialog = true;
    },
    submitRating() {
      if (this.ratingForm.rating === 0) {
        this.$notify({
          message: "Please select a rating.",
          icon: "error",
          horizontalAlign: "right",
          verticalAlign: "top",
          type: "danger",
        });
        return;
      }

      const currentUser = getCurrentUser();
      const rating = {
        id: Date.now().toString(),
        sessionId: this.ratingSession.id,
        tutorId: currentUser.id,
        tutorName: currentUser.name,
        studentId: this.ratingSession.studentId,
        studentName: this.ratingSession.studentName,
        subject: this.ratingSession.subject,
        rating: this.ratingForm.rating,
        comment: this.ratingForm.comment.trim() || "",
        date: new Date(),
      };

      // Save rating
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("app_tutor_student_ratings");
          const ratings = raw ? JSON.parse(raw) : [];
          ratings.push(rating);
          window.localStorage.setItem("app_tutor_student_ratings", JSON.stringify(ratings));
        } catch (e) {
          console.error("Failed to save rating", e);
        }
      }

      this.showDialog = false;
      this.loadCompletedSessions();

      this.$notify({
        message: "Student rated successfully!",
        icon: "check",
        horizontalAlign: "right",
        verticalAlign: "top",
        type: "success",
      });
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
  },
};
</script>

<style scoped>
.stats-row {
  margin-bottom: 24px;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  margin-top: 4px;
}

.section-title {
  margin-top: 24px;
  margin-bottom: 8px;
}

.text-right {
  text-align: right;
}
</style>

