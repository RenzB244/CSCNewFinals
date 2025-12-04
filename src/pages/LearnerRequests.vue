<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <div class="md-layout" style="margin-bottom: 24px">
          <div class="md-layout-item md-size-50">
            <h4 class="title">My Requests</h4>
          </div>
          <div class="md-layout-item md-size-50 text-right">
            <md-button
              class="md-primary"
              @click="showAIRecommendation"
              style="margin-right: 8px"
            >
              <md-icon>auto_awesome</md-icon>
              AI Recommendation
            </md-button>
            <md-button class="md-primary" @click="browseAllTutors">
              <md-icon>people</md-icon>
              Browse All Tutors
            </md-button>
          </div>
        </div>

        <div v-if="myRequests.length === 0" class="empty-state">
          <md-card>
            <md-card-content style="text-align: center; padding: 48px">
              <md-icon style="font-size: 64px; color: #999; margin-bottom: 16px">
                description
              </md-icon>
              <h5>No requests at the moment</h5>
              <md-button
                class="md-primary md-raised"
                @click="showCreateRequestDialog"
                style="margin-top: 16px"
              >
                Create Your First Request
              </md-button>
            </md-card-content>
          </md-card>
        </div>

        <div v-else>
          <md-card v-for="request in myRequests" :key="request.id" style="margin-bottom: 16px">
            <md-card-content>
              <div class="md-layout">
                <div class="md-layout-item md-size-75">
                  <h5>{{ request.subject }}</h5>
                  <p style="color: #666">
                    Requested to: {{ request.tutorName }}
                  </p>
                  <p style="color: #666; font-size: 14px">
                    {{ formatDate(request.date) }}
                  </p>
                </div>
                <div class="md-layout-item md-size-25 text-right">
                  <span
                    class="md-badge"
                    :class="{
                      'md-warning': request.status === 'pending',
                      'md-success': request.status === 'accepted',
                      'md-danger': request.status === 'rejected',
                    }"
                  >
                    {{ request.status }}
                  </span>
                </div>
              </div>
            </md-card-content>
          </md-card>
        </div>
      </div>
    </div>

    <!-- Create Request Dialog -->
    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Create Tutoring Request</md-dialog-title>
      <md-dialog-content>
        <div class="md-layout md-gutter">
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>Select Tutor</label>
              <md-select v-model="newRequest.tutorId" required>
                <md-option
                  v-for="tutor in availableTutors"
                  :key="tutor.id"
                  :value="tutor.id"
                >
                  {{ tutor.name }}
                </md-option>
              </md-select>
            </md-field>
          </div>
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>Subject</label>
              <md-select v-model="newRequest.subject" required :disabled="!newRequest.tutorId || availableSubjects.length === 0">
                <md-option
                  v-for="subject in availableSubjects"
                  :key="subject"
                  :value="subject"
                >
                  {{ subject }}
                </md-option>
              </md-select>
            </md-field>
          </div>
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>Preferred Date</label>
              <md-input v-model="newRequest.preferredDate" type="date"></md-input>
            </md-field>
          </div>
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>Preferred Time</label>
              <md-input v-model="newRequest.preferredTime" type="time"></md-input>
            </md-field>
          </div>
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>Additional Notes (Optional)</label>
              <md-textarea v-model="newRequest.notes"></md-textarea>
            </md-field>
          </div>
        </div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showDialog = false">Cancel</md-button>
        <md-button class="md-primary" @click="createRequest">Create Request</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import { getCurrentUser, getUsers } from "@/helpers/storage";
import { acceptTutoringRequest } from "@/helpers/storage";

export default {
  name: "LearnerRequests",
  data() {
    return {
      myRequests: [],
      availableTutors: [],
      showDialog: false,
      newRequest: {
        tutorId: null,
        subject: "",
        preferredDate: "",
        preferredTime: "",
        notes: "",
      },
      availableSubjects: [],
    };
  },
  created() {
    this.loadRequests();
    this.loadAvailableTutors();
    
    // Check if tutorId is in query params (from AI Recommendation or Browse Tutors)
    if (this.$route.query.tutorId) {
      this.newRequest.tutorId = this.$route.query.tutorId;
      this.showCreateRequestDialog();
    }
  },
  watch: {
    "newRequest.tutorId"(newTutorId) {
      if (newTutorId) {
        this.onTutorChange();
      }
    },
  },
  methods: {
    loadRequests() {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return;
      }

      // Load requests from localStorage
      const requests = this.getMyRequests(currentUser.id);
      this.myRequests = requests;
    },
    loadAvailableTutors() {
      const users = getUsers();
      const realTutors = users.filter(
        (u) => u.role === "tutor" && u.status === "approved"
      );

      // Add mock tutors for display (same as in AI Recommendation and Browse Tutors)
      const mockTutors = [
        {
          id: "mock-1",
          name: "Dr. Sarah Johnson",
          email: "sarah.johnson@example.com",
          role: "tutor",
          status: "approved",
          subjects: "Mathematics, Calculus, Linear Algebra",
          bio: "PhD in Mathematics with 10+ years of teaching experience.",
        },
        {
          id: "mock-2",
          name: "Prof. Michael Chen",
          email: "michael.chen@example.com",
          role: "tutor",
          status: "approved",
          subjects: "Physics, Quantum Mechanics",
          bio: "Professor of Physics with expertise in quantum mechanics.",
        },
        {
          id: "mock-3",
          name: "Dr. Emily Rodriguez",
          email: "emily.rodriguez@example.com",
          role: "tutor",
          status: "approved",
          subjects: "English Literature, Writing",
          bio: "Published author and literature professor.",
        },
        {
          id: "mock-4",
          name: "Dr. James Wilson",
          email: "james.wilson@example.com",
          role: "tutor",
          status: "approved",
          subjects: "Chemistry, Organic Chemistry",
          bio: "Chemistry professor with research background.",
        },
        {
          id: "mock-5",
          name: "Ms. Lisa Anderson",
          email: "lisa.anderson@example.com",
          role: "tutor",
          status: "approved",
          subjects: "Computer Science, Programming",
          bio: "Software engineer and coding instructor.",
        },
        {
          id: "mock-6",
          name: "Dr. Robert Taylor",
          email: "robert.taylor@example.com",
          role: "tutor",
          status: "approved",
          subjects: "Biology, Anatomy",
          bio: "Medical doctor and biology professor.",
        },
        {
          id: "mock-7",
          name: "Prof. Maria Garcia",
          email: "maria.garcia@example.com",
          role: "tutor",
          status: "approved",
          subjects: "Spanish, Linguistics",
          bio: "Native Spanish speaker and linguistics professor.",
        },
        {
          id: "mock-8",
          name: "Dr. David Kim",
          email: "david.kim@example.com",
          role: "tutor",
          status: "approved",
          subjects: "Statistics, Data Analysis",
          bio: "Statistics professor and data scientist.",
        },
      ];

      // Combine real and mock tutors
      this.availableTutors = [...realTutors, ...mockTutors];
    },
    getMyRequests(userId) {
      if (typeof window === "undefined") {
        return [];
      }
      try {
        const raw = window.localStorage.getItem("app_learner_requests");
        if (!raw) {
          return [];
        }
        const allRequests = JSON.parse(raw);
        return allRequests.filter((r) => r.studentId === userId);
      } catch (e) {
        return [];
      }
    },
    saveRequest(request) {
      if (typeof window === "undefined") {
        return;
      }
      try {
        const raw = window.localStorage.getItem("app_learner_requests");
        const requests = raw ? JSON.parse(raw) : [];
        requests.push(request);
        window.localStorage.setItem("app_learner_requests", JSON.stringify(requests));
      } catch (e) {
        console.error("Failed to save request", e);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    showCreateRequestDialog() {
      // If tutorId is already set (from query params), keep it
      if (!this.newRequest.tutorId) {
        this.newRequest = {
          tutorId: null,
          subject: "",
          preferredDate: "",
          preferredTime: "",
          notes: "",
        };
      }
      this.availableSubjects = [];
      
      // If tutorId is set, load subjects for that tutor
      if (this.newRequest.tutorId) {
        this.onTutorChange();
      }
      
      this.showDialog = true;
    },
    onTutorChange() {
      // Reset subject when tutor changes
      this.newRequest.subject = "";
      
      // Get selected tutor's subjects
      if (this.newRequest.tutorId) {
        const selectedTutor = this.availableTutors.find(
          (t) => t.id === this.newRequest.tutorId
        );
        
        if (selectedTutor) {
          // Check if tutor has subjects
          if (selectedTutor.subjects && selectedTutor.subjects.trim().length > 0) {
            // Parse comma-separated subjects
            this.availableSubjects = selectedTutor.subjects
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            
            // If parsing resulted in empty array, use default
            if (this.availableSubjects.length === 0) {
              this.availableSubjects = ["General Tutoring"];
            }
          } else {
            // No subjects defined, use default
            this.availableSubjects = ["General Tutoring"];
          }
        } else {
          this.availableSubjects = ["General Tutoring"];
        }
      } else {
        this.availableSubjects = [];
      }
    },
    createRequest() {
      if (!this.newRequest.tutorId || !this.newRequest.subject) {
        this.$notify({
          message: "Please fill in all required fields.",
          icon: "error",
          horizontalAlign: "right",
          verticalAlign: "top",
          type: "danger",
        });
        return;
      }

      const currentUser = getCurrentUser();
      const selectedTutor = this.availableTutors.find(
        (t) => t.id === this.newRequest.tutorId
      );

      const request = {
        id: Date.now().toString(),
        studentId: currentUser.id,
        studentName: currentUser.name,
        tutorId: this.newRequest.tutorId,
        tutorName: selectedTutor ? selectedTutor.name : "Unknown",
        subject: this.newRequest.subject,
        preferredDate: this.newRequest.preferredDate,
        preferredTime: this.newRequest.preferredTime,
        notes: this.newRequest.notes,
        status: "pending",
        date: new Date(),
      };

      this.saveRequest(request);
      this.loadRequests();
      this.showDialog = false;

      // Also notify the tutor by creating a request in their requests list
      this.notifyTutor(request);

      this.$notify({
        message: "Request created successfully!",
        icon: "check",
        horizontalAlign: "right",
        verticalAlign: "top",
        type: "success",
      });
    },
    notifyTutor(request) {
      // Save to tutor's requests list
      if (typeof window === "undefined") {
        return;
      }
      try {
        const raw = window.localStorage.getItem("app_tutor_requests");
        const tutorRequests = raw ? JSON.parse(raw) : [];
        // Check if request already exists
        const exists = tutorRequests.some((r) => r.id === request.id);
        if (!exists) {
          tutorRequests.push({
            ...request,
            tutorId: request.tutorId,
          });
          window.localStorage.setItem("app_tutor_requests", JSON.stringify(tutorRequests));
        }
      } catch (e) {
        console.error("Failed to notify tutor", e);
      }
    },
    showAIRecommendation() {
      this.$router.push("/ai-recommendation");
    },
    browseAllTutors() {
      this.$router.push("/browse-tutors");
    },
  },
};
</script>

<style scoped>
.empty-state {
  margin-top: 24px;
}

.text-right {
  text-align: right;
}
</style>

