<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="orange">
            <h4 class="title">Tutor Approvals</h4>
            <p class="category">Review and approve/reject tutor applications</p>
          </md-card-header>
          <md-card-content>
            <div class="md-layout md-gutter stats-row" style="margin-bottom: 24px">
              <div class="md-layout-item md-size-33">
                <h5>Pending Applications</h5>
                <p class="stat-number">{{ pendingTutors.length }}</p>
              </div>
            </div>

            <h4 class="section-title">Pending Tutor Applications</h4>
            <div v-if="pendingTutors.length === 0" class="md-body-1">
              No pending tutor applications.
            </div>

            <div v-else class="table-responsive">
              <table class="md-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Credentials</th>
                    <th>Credential Image</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tutor in pendingTutors" :key="tutor.id">
                    <td>{{ tutor.name }}</td>
                    <td>{{ tutor.email }}</td>
                    <td>
                      <span class="md-caption" style="max-width: 200px; display: block; word-wrap: break-word;">
                        {{ tutor.credentials || "No credentials provided" }}
                      </span>
                    </td>
                    <td>
                      <div v-if="tutor.credentialImage">
                        <img
                          :src="tutor.credentialImage"
                          alt="Credential"
                          class="credential-thumb"
                          @click="viewImage(tutor.credentialImage)"
                          style="cursor: pointer"
                        />
                      </div>
                      <span v-else class="md-caption">No image</span>
                    </td>
                    <td>
                      <span class="md-badge md-warning">
                        {{ tutor.status || "pending" }}
                      </span>
                    </td>
                    <td>
                      <md-button
                        class="md-raised md-success"
                        @click="approve(tutor.id)"
                        style="margin-right: 8px"
                      >
                        Accept
                      </md-button>
                      <md-button
                        class="md-raised md-danger"
                        @click="reject(tutor.id)"
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

    <!-- Image View Dialog -->
    <md-dialog :md-active.sync="showImageDialog">
      <md-dialog-title>Credential Image</md-dialog-title>
      <md-dialog-content>
        <img :src="selectedImage" alt="Credential" style="max-width: 100%; height: auto;" />
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showImageDialog = false">Close</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import {
  getPendingTutors,
  approveTutor,
  rejectTutor,
} from "@/helpers/storage";

export default {
  name: "AdminTutorApprovals",
  data() {
    return {
      pendingTutors: [],
      showImageDialog: false,
      selectedImage: "",
    };
  },
  created() {
    this.refresh();
  },
  methods: {
    refresh() {
      this.pendingTutors = getPendingTutors();
    },
    approve(id) {
      approveTutor(id);
      this.refresh();
      this.$notify({
        message: "Tutor approved successfully.",
        icon: "check",
        horizontalAlign: "right",
        verticalAlign: "top",
        type: "success",
      });
    },
    reject(id) {
      if (
        // eslint-disable-next-line no-restricted-globals
        confirm("Are you sure you want to reject this tutor application?")
      ) {
        rejectTutor(id);
        this.refresh();
        this.$notify({
          message: "Tutor request rejected.",
          icon: "close",
          horizontalAlign: "right",
          verticalAlign: "top",
          type: "danger",
        });
      }
    },
    viewImage(imageSrc) {
      this.selectedImage = imageSrc;
      this.showImageDialog = true;
    },
  },
};
</script>

<style scoped>
.credential-thumb {
  max-width: 80px;
  max-height: 80px;
  border-radius: 4px;
  object-fit: cover;
}

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

.table-responsive {
  overflow-x: auto;
}
</style>

