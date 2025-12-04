<template>
  <div class="content auth-page">
    <div class="md-layout md-alignment-center-center auth-layout">
      <div
        class="md-layout-item auth-card md-small-size-60 md-xsmall-size-90"
      >
        <md-card>
          <md-card-header data-background-color="green">
            <h4 class="title">Sign Up</h4>
            <p class="category">Create a new account</p>
          </md-card-header>

          <md-card-content>
            <form @submit.prevent="onSubmit">
              <md-field>
                <label>Name</label>
                <md-input v-model="form.name" required />
              </md-field>

              <md-field>
                <label>Email</label>
                <md-input v-model="form.email" type="email" required />
              </md-field>

              <md-field>
                <label>Password</label>
                <md-input v-model="form.password" type="password" required />
              </md-field>

              <md-field>
                <label>Confirm Password</label>
                <md-input
                  v-model="form.confirmPassword"
                  type="password"
                  required
                />
              </md-field>

              <div class="role-select">
                <label class="md-body-1">Sign up as</label>
                <div>
                  <md-radio v-model="form.role" value="user">User</md-radio>
                  <md-radio v-model="form.role" value="tutor">Tutor</md-radio>
                </div>
              </div>

              <div class="payment-section">
                <label class="md-body-1" style="display: block; margin-bottom: 8px">
                  Payment (₱50 required)
                </label>
                <div class="gcash-card" style="background-color: #0066cc; color: white; cursor: pointer; border-radius: 4px; overflow: hidden;" @click="redirectToGCash">
                  <md-card style="margin: 0; background-color: transparent; box-shadow: none;">
                  <md-card-content style="padding: 16px; display: flex; align-items: center; justify-content: space-between">
                    <div style="display: flex; align-items: center">
                      <md-icon style="color: white; margin-right: 12px; font-size: 32px">account_balance_wallet</md-icon>
                      <div>
                        <h5 style="margin: 0; color: white">Pay with GCash</h5>
                        <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px">Click to pay ₱50 via GCash</p>
                      </div>
                    </div>
                    <md-icon style="color: white">arrow_forward</md-icon>
                  </md-card-content>
                  </md-card>
                </div>
                <p class="md-caption" style="margin-top: 8px; color: #666">
                  After completing payment in GCash, copy your transaction ID and paste it below.
                </p>
                
                <md-field style="margin-top: 16px">
                  <label>Transaction ID (Required)</label>
                  <md-input
                    v-model="form.transactionId"
                    placeholder="Paste your GCash transaction ID here"
                    required
                  />
                  <span class="md-helper-text">Enter the transaction ID from your GCash payment receipt</span>
                </md-field>
              </div>

              <div v-if="form.role === 'tutor'">
                <label class="md-body-1"
                  >Tutor credentials (license, experience, etc.)</label
                >
                <div class="credential-upload">
                  <input
                    type="file"
                    accept="image/*"
                    @change="onFileChange"
                  />
                  <p class="md-caption">
                    Upload a clear photo or scan of your ID, license, or other
                    proof.
                  </p>
                  <div v-if="form.credentialImagePreview" class="image-preview">
                    <p class="md-caption">Preview:</p>
                    <img :src="form.credentialImagePreview" alt="Credential" />
                  </div>
                </div>
                <p class="md-caption">
                  Your tutor account will need admin approval before you can log
                  in.
                </p>
              </div>

              <div v-if="error" class="text-danger auth-error">
                {{ error }}
              </div>

              <div v-if="info" class="text-info auth-info">
                {{ info }}
              </div>

              <div class="auth-actions">
                <md-button
                  type="submit"
                  class="md-raised md-success"
                  :disabled="loading"
                >
                  {{ loading ? "Submitting..." : "Sign Up" }}
                </md-button>

                <router-link to="/login" class="signup-link">
                  Already have an account? Login
                </router-link>
              </div>
            </form>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import { registerUser, setCurrentUser } from "@/helpers/storage";

export default {
  name: "SignUpPage",
  data() {
    return {
      form: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
        credentials: "",
        credentialImage: "",
        credentialImagePreview: "",
        paymentStatus: "unpaid",
        transactionId: "",
      },
      loading: false,
      error: "",
      info: "",
    };
  },
  created() {
    this.checkPaymentStatus();
  },
  methods: {
    redirectToGCash() {
      // GCash payment URL (mock - replace with actual GCash payment URL)
      // In production, this would be the actual GCash payment gateway URL
      const gcashUrl = "https://www.gcash.com/pay?amount=50&return_url=" + 
        encodeURIComponent(window.location.origin + "/signup");
      
      // For demo purposes, show instructions
      // In production, redirect to actual GCash
      const message = "You will be redirected to GCash to complete payment of ₱50.\n\n" +
        "After payment:\n" +
        "1. Copy your transaction ID from GCash\n" +
        "2. Return to this page\n" +
        "3. Paste the transaction ID in the field below\n" +
        "4. Complete your registration\n\n" +
        "(In demo mode, click OK to simulate opening GCash)";
      
      if (confirm(message)) {
        // In production, uncomment this to redirect to actual GCash:
        // window.location.href = gcashUrl;
        
        // For demo: show info message
        this.$notify({
          message: "After completing payment in GCash, copy your transaction ID and paste it in the Transaction ID field below.",
          icon: "info",
          horizontalAlign: "right",
          verticalAlign: "top",
          type: "info",
          duration: 5000,
        });
      }
    },
    checkPaymentStatus() {
      // Check if returning from GCash payment
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("payment") === "success") {
        // Restore form data if available
        const pendingData = sessionStorage.getItem("pending_signup");
        if (pendingData) {
          const data = JSON.parse(pendingData);
          this.form.name = data.name || "";
          this.form.email = data.email || "";
          this.form.password = data.password || "";
          this.form.confirmPassword = data.confirmPassword || "";
          this.form.role = data.role || "user";
          this.form.credentials = data.credentials || "";
          this.form.credentialImage = data.credentialImage || "";
          sessionStorage.removeItem("pending_signup");
        }
        this.$notify({
          message: "Please enter your GCash transaction ID to complete registration.",
          icon: "info",
          horizontalAlign: "right",
          verticalAlign: "top",
          type: "info",
        });
      }
    },
    onFileChange(e) {
      const file = e.target.files[0];
      if (!file) {
        this.form.credentialImage = "";
        this.form.credentialImagePreview = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        this.form.credentialImage = evt.target.result;
        this.form.credentialImagePreview = evt.target.result;
      };
      reader.readAsDataURL(file);
    },
    async onSubmit() {
      this.error = "";
      this.info = "";

      if (this.form.password !== this.form.confirmPassword) {
        this.error = "Passwords do not match";
        return;
      }

      if (!this.form.email || !this.form.password || !this.form.name) {
        this.error = "Please fill in all required fields";
        return;
      }

      if (!this.form.transactionId || !this.form.transactionId.trim()) {
        this.error = "Please enter your GCash transaction ID";
        return;
      }

      // Validate transaction ID format (basic validation)
      if (this.form.transactionId.trim().length < 5) {
        this.error = "Please enter a valid transaction ID";
        return;
      }

      this.loading = true;
      try {
        const user = await registerUser({
          name: this.form.name.trim(),
          email: this.form.email.trim(),
          password: this.form.password,
          role: this.form.role,
          credentials: this.form.credentials.trim(),
          credentialImage: this.form.credentialImage,
          paymentStatus: "paid",
          transactionId: this.form.transactionId.trim(),
        });

        if (user.role === "user") {
          // Auto-login normal users and redirect to learner dashboard
          setCurrentUser(user);
          this.$router.push("/learner-dashboard");
        } else {
          // Auto-login tutors and redirect to tutor dashboard
          // They can access home page but not other features until admin approval
          setCurrentUser(user);
          this.$router.push("/tutor-dashboard");
        }
      } catch (e) {
        this.error = e.message || "Sign up failed";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-layout {
  width: 100%;
  justify-content: center;
}

.auth-card {
  max-width: 480px;
}

.auth-actions {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.signup-link {
  font-size: 14px;
  margin-top: 8px;
}

.auth-error {
  margin-top: 8px;
}

.auth-info {
  margin-top: 8px;
}

.role-select {
  margin: 16px 0;
}

.credential-upload {
  margin-top: 12px;
}

.image-preview {
  margin-top: 8px;
}

.image-preview img {
  max-width: 100%;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.gcash-card {
  transition: transform 0.2s, box-shadow 0.2s;
  user-select: none;
}

.gcash-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 102, 204, 0.3);
}

.gcash-card .md-card {
  pointer-events: none;
}
</style>

