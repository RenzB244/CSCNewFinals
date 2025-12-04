<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="purple">
            <h4 class="title">Total Earnings</h4>
            <p class="category">Payment tracking and revenue</p>
          </md-card-header>
          <md-card-content>
            <div class="md-layout md-gutter" style="margin-bottom: 24px">
              <div class="md-layout-item md-medium-size-100 md-size-50">
                <md-card>
                  <md-card-content style="text-align: center; padding: 32px">
                    <h2 class="title" style="margin: 0; font-size: 48px; color: #9c27b0">
                      ₱{{ totalEarnings }}
                    </h2>
                    <p style="margin: 8px 0; color: #666; font-size: 18px">Total Earnings</p>
                  </md-card-content>
                </md-card>
              </div>
              <div class="md-layout-item md-medium-size-100 md-size-50">
                <md-card>
                  <md-card-content style="text-align: center; padding: 32px">
                    <h2 class="title" style="margin: 0; font-size: 48px; color: #4caf50">
                      {{ totalPayments }}
                    </h2>
                    <p style="margin: 8px 0; color: #666; font-size: 18px">Total Payments</p>
                  </md-card-content>
                </md-card>
              </div>
            </div>

            <h4 class="section-title">Payment History</h4>
            <div v-if="payments.length === 0" class="md-body-1">
              No payments recorded yet.
            </div>
            <div v-else class="table-responsive">
              <table class="md-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Amount</th>
                    <th>Payment Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="payment in payments" :key="payment.id">
                    <td>{{ payment.userName }}</td>
                    <td>{{ payment.userEmail }}</td>
                    <td>{{ payment.userRole }}</td>
                    <td>₱{{ payment.amount }}</td>
                    <td>{{ formatDate(payment.date) }}</td>
                    <td>
                      <span class="md-badge md-success">Paid</span>
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
import { getTotalEarnings, getAllPayments } from "@/helpers/storage";

export default {
  name: "AdminEarnings",
  data() {
    return {
      totalEarnings: 0,
      totalPayments: 0,
      payments: [],
    };
  },
  created() {
    this.loadEarnings();
  },
  methods: {
    loadEarnings() {
      this.totalEarnings = getTotalEarnings();
      this.payments = getAllPayments();
      this.totalPayments = this.payments.length;
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
  margin-bottom: 16px;
}

.table-responsive {
  overflow-x: auto;
}
</style>

