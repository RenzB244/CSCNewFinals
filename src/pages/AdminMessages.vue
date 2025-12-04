<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="green">
            <h4 class="title">Messages</h4>
            <p class="category">Messages from users with concerns</p>
          </md-card-header>
          <md-card-content>
            <div v-if="messages.length === 0" class="md-body-1">
              No messages from users.
            </div>
            <div v-else>
              <div
                v-for="message in messages"
                :key="message.id"
                class="message-item"
                style="
                  padding: 16px;
                  border-bottom: 1px solid #eee;
                  margin-bottom: 8px;
                "
              >
                <div style="display: flex; justify-content: space-between; align-items: start">
                  <div style="flex: 1">
                    <h5 style="margin: 0; margin-bottom: 8px">
                      From: {{ message.senderName }} ({{ message.senderEmail }})
                    </h5>
                    <p style="margin: 4px 0; color: #666; font-size: 14px">
                      {{ formatDate(message.timestamp) }}
                    </p>
                    <p style="margin: 8px 0; color: #333">
                      {{ message.text }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import { getAdminMessages } from "@/helpers/storage";

export default {
  name: "AdminMessages",
  data() {
    return {
      messages: [],
    };
  },
  created() {
    this.loadMessages();
  },
  methods: {
    loadMessages() {
      this.messages = getAdminMessages();
    },
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString();
    },
  },
};
</script>

<style scoped>
.message-item:last-child {
  border-bottom: none;
}
</style>

