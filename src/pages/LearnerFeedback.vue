<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="red">
            <h4 class="title">Feedback & Reviews</h4>
            <p class="category">Rate and review your tutors</p>
          </md-card-header>
          <md-card-content>
            <h4 class="section-title">Completed Sessions</h4>
            <div v-if="completedSessions.length === 0" class="md-body-1">
              No completed sessions yet. Complete a session to leave feedback.
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
                        Tutor: {{ session.tutorName }}
                      </p>
                      <p style="margin: 4px 0; color: #666; font-size: 14px">
                        {{ formatDate(session.dateTime) }}
                      </p>
                    </div>
                    <div class="md-layout-item md-size-25 text-right">
                      <md-button
                        v-if="!session.hasFeedback"
                        class="md-primary md-raised"
                        @click="showFeedbackDialog(session)"
                      >
                        Leave Feedback
                      </md-button>
                      <span v-else class="md-caption">Feedback submitted</span>
                    </div>
                  </div>
                </md-card-content>
              </md-card>
            </div>

            <h4 class="section-title" style="margin-top: 24px">Your Reviews</h4>
            <div v-if="myReviews.length === 0" class="md-body-1">
              No reviews submitted yet.
            </div>
            <div v-else>
              <md-card
                v-for="review in myReviews"
                :key="review.id"
                style="margin-bottom: 16px"
              >
                <md-card-content>
                  <div class="md-layout">
                    <div class="md-layout-item md-size-100">
                      <h5 style="margin: 0">{{ review.tutorName }}</h5>
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

    <!-- Feedback Dialog -->
    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Rate Your Tutor</md-dialog-title>
      <md-dialog-content>
        <div class="md-layout md-gutter">
          <div class="md-layout-item md-size-100">
            <p><strong>{{ feedbackSession.tutorName }}</strong></p>
            <p>{{ feedbackSession.subject }}</p>
          </div>
          <div class="md-layout-item md-size-100">
            <label>Rating</label>
            <div style="display: flex; gap: 8px; margin-top: 8px">
              <div
                v-for="i in 5"
                :key="i"
                @click="feedbackForm.rating = i"
                style="cursor: pointer; display: inline-block;"
              >
                <md-icon
                  :style="{
                    color: i <= feedbackForm.rating ? '#ffc107' : '#ddd',
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
              <label>Your Review</label>
              <md-textarea v-model="feedbackForm.comment" required></md-textarea>
            </md-field>
          </div>
        </div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showDialog = false">Cancel</md-button>
        <md-button class="md-primary" @click="submitFeedback">Submit Feedback</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import { getCurrentUser } from "@/helpers/storage";

export default {
  name: "LearnerFeedback",
  data() {
    return {
      completedSessions: [],
      myReviews: [],
      showDialog: false,
      feedbackSession: {},
      feedbackForm: {
        rating: 0,
        comment: "",
      },
    };
  },
  created() {
    this.loadCompletedSessions();
    this.loadMyReviews();
  },
  methods: {
    loadCompletedSessions() {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return;
      }

      // Get all accepted requests (sessions)
      const acceptedRequests = this.getAcceptedRequestsForLearner(currentUser.id);
      
      // For now, consider all sessions as completed if they're in the past
      // In a real app, you'd have a separate "completed" status
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
            tutorName: request.tutorName,
            tutorId: request.tutorId,
            dateTime: dateTime,
            hasFeedback: this.hasFeedbackForSession(request.id),
          };
        })
        .filter((session) => {
          // Show sessions that are in the past or today
          return new Date(session.dateTime) <= new Date();
        });
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
    hasFeedbackForSession(sessionId) {
      return this.myReviews.some((r) => r.sessionId === sessionId);
    },
    loadMyReviews() {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return;
      }

      if (typeof window === "undefined") {
        return;
      }
      try {
        const raw = window.localStorage.getItem("app_learner_reviews");
        if (!raw) {
          return;
        }
        const allReviews = JSON.parse(raw);
        this.myReviews = allReviews.filter(
          (r) => r.studentId === currentUser.id
        );
      } catch (e) {
        this.myReviews = [];
      }
    },
    showFeedbackDialog(session) {
      this.feedbackSession = session;
      this.feedbackForm = {
        rating: 0,
        comment: "",
      };
      this.showDialog = true;
    },
    submitFeedback() {
      if (this.feedbackForm.rating === 0) {
        this.$notify({
          message: "Please select a rating.",
          icon: "error",
          horizontalAlign: "right",
          verticalAlign: "top",
          type: "danger",
        });
        return;
      }

      if (!this.feedbackForm.comment.trim()) {
        this.$notify({
          message: "Please write a review.",
          icon: "error",
          horizontalAlign: "right",
          verticalAlign: "top",
          type: "danger",
        });
        return;
      }

      const currentUser = getCurrentUser();
      const review = {
        id: Date.now().toString(),
        sessionId: this.feedbackSession.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        tutorId: this.feedbackSession.tutorId,
        tutorName: this.feedbackSession.tutorName,
        subject: this.feedbackSession.subject,
        rating: this.feedbackForm.rating,
        comment: this.feedbackForm.comment.trim(),
        date: new Date(),
      };

      // Save review
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("app_learner_reviews");
          const reviews = raw ? JSON.parse(raw) : [];
          reviews.push(review);
          window.localStorage.setItem("app_learner_reviews", JSON.stringify(reviews));

          // Also save to tutor reviews
          const tutorReviewsRaw = window.localStorage.getItem("app_tutor_reviews");
          const tutorReviews = tutorReviewsRaw ? JSON.parse(tutorReviewsRaw) : [];
          tutorReviews.push(review);
          window.localStorage.setItem("app_tutor_reviews", JSON.stringify(tutorReviews));
        } catch (e) {
          console.error("Failed to save review", e);
        }
      }

      this.showDialog = false;
      this.loadCompletedSessions();
      this.loadMyReviews();

      this.$notify({
        message: "Feedback submitted successfully!",
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
.section-title {
  margin-top: 24px;
  margin-bottom: 8px;
}

.text-right {
  text-align: right;
}
</style>

