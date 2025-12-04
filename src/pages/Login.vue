<template>
  <div class="content auth-page">
    <div class="md-layout md-alignment-center-center auth-layout">
      <div
        class="md-layout-item auth-card md-small-size-60 md-xsmall-size-90"
      >
        <md-card>
          <md-card-header data-background-color="blue">
            <h4 class="title">Login</h4>
            <p class="category">Access your account</p>
          </md-card-header>

          <md-card-content>
            <form @submit.prevent="onSubmit">
              <md-field>
                <label>Email</label>
                <md-input v-model="form.email" type="email" required />
              </md-field>

              <md-field>
                <label>Password</label>
                <md-input v-model="form.password" type="password" required />
              </md-field>

              <div v-if="error" class="text-danger auth-error">
                {{ error }}
              </div>

              <div v-if="info" class="text-info auth-info">
                {{ info }}
              </div>

              <div class="auth-actions">
                <md-button
                  type="submit"
                  class="md-raised md-primary auth-login-button"
                  :disabled="loading"
                >
                  {{ loading ? "Logging in..." : "Login" }}
                </md-button>

                <router-link to="/signup" class="signup-link">
                  No account yet? Sign up
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
import { loginUser } from "@/helpers/storage";

export default {
  name: "LoginPage",
  data() {
    return {
      form: {
        email: "",
        password: "",
      },
      loading: false,
      error: "",
      info: "",
    };
  },
  methods: {
    async onSubmit() {
      this.error = "";
      this.info = "";
      this.loading = true;
      try {
        const user = await loginUser({
          email: this.form.email.trim(),
          password: this.form.password,
        });

        if (user.role === "admin") {
          this.$router.push("/admin/home");
        } else if (user.role === "tutor") {
          this.$router.push("/tutor-dashboard");
        } else {
          this.$router.push("/learner-dashboard");
        }
      } catch (e) {
        this.error = e.message || "Login failed";
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
  max-width: 420px;
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

.auth-hint {
  display: none;
}
</style>

