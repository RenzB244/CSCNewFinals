<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="orange">
            <h4 class="title">Tutoring Requests</h4>
            <p class="category">Manage incoming tutoring requests from students</p>
          </md-card-header>
          <md-card-content>
            <div v-if="requests.length === 0" class="md-body-1">
              No tutoring requests at this time.
            </div>
            <div v-else class="table-responsive">
              <table class="md-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Subject</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="request in requests" :key="request.id">
                    <td>{{ request.studentName }}</td>
                    <td>{{ request.subject }}</td>
                    <td>{{ formatDate(request.date) }}</td>
                    <td>
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
                    </td>
                    <td>
                      <md-button
                        v-if="request.status === 'pending'"
                        class="md-raised md-success"
                        @click="acceptRequest(request.id)"
                        style="margin-right: 8px"
                      >
                        Accept
                      </md-button>
                      <md-button
                        v-if="request.status === 'pending'"
                        class="md-raised md-danger"
                        @click="rejectRequest(request.id)"
                      >
                        Reject
                      </md-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentUser, acceptTutoringRequest } from "@/helpers/storage";

export default {
  name: "TutorRequests",
  data() {
    return {
      requests: [],
    };
  },
  created() {
    this.loadRequests();
  },
  methods: {
    loadRequests() {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return;
      }

      // Load requests from localStorage
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("app_tutor_requests");
          if (raw) {
            const allRequests = JSON.parse(raw);
            this.requests = allRequests.filter(
              (r) => r.tutorId === currentUser.id
            );
          }
        } catch (e) {
          console.error("Failed to load requests", e);
        }
      }
    },
    updateRequestStatus(requestId, status) {
      if (typeof window === "undefined") {
        return;
      }
      try {
        const raw = window.localStorage.getItem("app_tutor_requests");
        if (raw) {
          const requests = JSON.parse(raw);
          const requestIndex = requests.findIndex((r) => r.id === requestId);
          if (requestIndex !== -1) {
            requests[requestIndex].status = status;
            window.localStorage.setItem("app_tutor_requests", JSON.stringify(requests));
          }
        }

        // Also update learner's request
        const learnerRaw = window.localStorage.getItem("app_learner_requests");
        if (learnerRaw) {
          const learnerRequests = JSON.parse(learnerRaw);
          const learnerRequestIndex = learnerRequests.findIndex((r) => r.id === requestId);
          if (learnerRequestIndex !== -1) {
            learnerRequests[learnerRequestIndex].status = status;
            window.localStorage.setItem("app_learner_requests", JSON.stringify(learnerRequests));
          }
        }
      } catch (e) {
        console.error("Failed to update request", e);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    acceptRequest(id) {
      const request = this.requests.find((r) => r.id === id);
      if (request) {
        const currentUser = getCurrentUser();
        if (currentUser) {
          // Ensure request has all necessary fields before accepting
          const requestToAccept = {
            ...request,
            id: request.id, // Ensure ID is preserved
            tutorId: currentUser.id,
            status: "accepted",
            studentId: request.studentId,
            studentName: request.studentName,
            tutorName: request.tutorName || currentUser.name,
            subject: request.subject,
            preferredDate: request.preferredDate,
            preferredTime: request.preferredTime,
            notes: request.notes,
          };
          acceptTutoringRequest(requestToAccept);
        }
        this.updateRequestStatus(id, "accepted");
        this.loadRequests();
        
        // Create a session entry for the schedule
        this.createSessionFromRequest(request);
        
        this.$notify({
          message: "Request accepted successfully. Session added to your schedule.",
          icon: "check",
          horizontalAlign: "right",
          verticalAlign: "top",
          type: "success",
        });
      }
    },
    createSessionFromRequest(request) {
      // Sessions are automatically created from accepted requests
      // The schedule page will load them from accepted requests
      // This method is here for future enhancements if needed
    },
    rejectRequest(id) {
      const request = this.requests.find((r) => r.id === id);
      if (request) {
        this.updateRequestStatus(id, "rejected");
        this.loadRequests();
        this.$notify({
          message: "Request rejected.",
          icon: "close",
          horizontalAlign: "right",
          verticalAlign: "top",
          type: "danger",
        });
      }
    },
  },
};
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

