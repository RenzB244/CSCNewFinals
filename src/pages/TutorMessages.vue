<template>
  <div class="content">
    <div class="md-layout md-gutter">
      <!-- Message Admin Section -->
      <div class="md-layout-item md-size-100" style="margin-bottom: 24px">
        <md-card>
          <md-card-header data-background-color="purple">
            <h4 class="title">Message Admin</h4>
            <p class="category">Send a message to admin with your concerns</p>
          </md-card-header>
          <md-card-content>
            <div class="md-layout md-gutter">
              <div class="md-layout-item md-size-100">
                <md-field>
                  <label>Your message/concern</label>
                  <md-textarea v-model="adminMessage" placeholder="Type your message or concern here..."></md-textarea>
                </md-field>
              </div>
              <div class="md-layout-item md-size-100 text-right">
                <md-button
                  class="md-primary md-raised"
                  @click="sendAdminMessage"
                  :disabled="!adminMessage.trim()"
                >
                  <md-icon>send</md-icon>
                  Send to Admin
                </md-button>
              </div>
            </div>
          </md-card-content>
        </md-card>
      </div>

      <!-- Student Conversations -->
      <div v-if="!selectedConversation" class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="green">
            <h4 class="title">Messages</h4>
            <p class="category">Communicate with your students</p>
          </md-card-header>
          <md-card-content>
            <div v-if="conversations.length === 0" class="md-body-1">
              No messages yet.
            </div>
            <div v-else>
              <md-list>
                <md-list-item
                  v-for="conversation in conversations"
                  :key="conversation.id"
                  @click="openConversation(conversation)"
                  style="cursor: pointer"
                >
                  <md-avatar class="md-avatar-icon md-primary">
                    <md-icon>person</md-icon>
                  </md-avatar>
                  <div class="md-list-item-text">
                    <span>{{ conversation.studentName }}</span>
                    <span>{{ conversation.lastMessage }}</span>
                  </div>
                  <span class="md-caption">{{ formatTime(conversation.lastMessageTime) }}</span>
                  <md-icon>chevron_right</md-icon>
                </md-list-item>
              </md-list>
            </div>
          </md-card-content>
        </md-card>
      </div>

      <!-- Chat View -->
      <div v-else class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="green">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%">
              <div>
                <h4 class="title">{{ selectedConversation.studentName }}</h4>
                <p class="category">Chat conversation</p>
              </div>
              <md-button class="md-icon-button" @click="closeConversation">
                <md-icon>arrow_back</md-icon>
              </md-button>
            </div>
          </md-card-header>
          <md-card-content style="height: 500px; display: flex; flex-direction: column">
            <!-- Messages Area -->
            <div class="messages-container" ref="messagesContainer">
              <div v-if="chatMessages.length === 0" class="empty-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
              <div
                v-for="message in chatMessages"
                :key="message.id"
                :class="['message', message.senderId === currentUser.id ? 'sent' : 'received']"
              >
                <div class="message-content">
                  <p>{{ message.text }}</p>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div class="message-input-container">
              <md-field>
                <md-input
                  v-model="newMessage"
                  placeholder="Type your message..."
                  @keyup.enter="sendMessage"
                ></md-input>
              </md-field>
              <md-button
                class="md-primary md-raised"
                @click="sendMessage"
                :disabled="!newMessage.trim()"
              >
                <md-icon>send</md-icon>
                Send
              </md-button>
            </div>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentUser, getAcceptedRequests, getMessages, addMessage, sendMessageToAdmin } from "@/helpers/storage";

export default {
  name: "TutorMessages",
  data() {
    return {
      conversations: [],
      selectedConversation: null,
      chatMessages: [],
      newMessage: "",
      adminMessage: "",
      currentUser: null,
    };
  },
  created() {
    this.currentUser = getCurrentUser();
    this.loadConversations();
  },
  watch: {
    selectedConversation() {
      if (this.selectedConversation) {
        this.loadChatMessages();
      }
    },
  },
  methods: {
    loadConversations() {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return;
      }

      // Get all accepted requests for this tutor
      const acceptedRequests = getAcceptedRequests(currentUser.id);
      
      // Get messages for accepted requests only
      const messages = getMessages(currentUser.id);
      
      // Build conversations from accepted requests
      this.conversations = acceptedRequests.map((request) => {
        // Find the last message for this student
        const studentMessages = messages.filter(
          (m) => (m.studentId || m.studentName) === (request.studentId || request.studentName)
        );
        const lastMessage = studentMessages.length > 0
          ? studentMessages[studentMessages.length - 1]
          : null;

        return {
          id: request.id,
          studentName: request.studentName,
          studentId: request.studentId || request.studentName,
          lastMessage: lastMessage
            ? lastMessage.text
            : "No messages yet. Start the conversation!",
          lastMessageTime: lastMessage
            ? new Date(lastMessage.timestamp)
            : new Date(request.acceptedAt || request.date),
        };
      });
    },
    loadChatMessages() {
      if (!this.selectedConversation || !this.currentUser) {
        return;
      }

      // Get all messages for this conversation
      const allMessages = getMessages(this.currentUser.id);
      this.chatMessages = allMessages
        .filter(
          (m) =>
            (m.studentId || m.studentName) === this.selectedConversation.studentId &&
            m.tutorId === this.currentUser.id
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    openConversation(conversation) {
      this.selectedConversation = conversation;
      this.newMessage = "";
    },
    closeConversation() {
      this.selectedConversation = null;
      this.chatMessages = [];
      this.newMessage = "";
      this.loadConversations(); // Refresh to update last message
    },
    sendMessage() {
      if (!this.newMessage.trim() || !this.selectedConversation || !this.currentUser) {
        return;
      }

      const message = {
        tutorId: this.currentUser.id,
        studentId: this.selectedConversation.studentId,
        studentName: this.selectedConversation.studentName,
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        text: this.newMessage.trim(),
      };

      addMessage(message);
      this.newMessage = "";
      this.loadChatMessages();
      this.loadConversations(); // Update conversation list
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    formatTime(date) {
      if (typeof date === "string") {
        date = new Date(date);
      }
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    sendAdminMessage() {
      if (!this.adminMessage.trim() || !this.currentUser) {
        return;
      }

      sendMessageToAdmin({
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        senderEmail: this.currentUser.email,
        text: this.adminMessage.trim(),
      });

      this.adminMessage = "";
      this.$notify({
        message: "Message sent to admin successfully!",
        icon: "check",
        horizontalAlign: "right",
        verticalAlign: "top",
        type: "success",
      });
    },
  },
};
</script>

<style scoped>
.md-list-item:hover {
  background-color: #f5f5f5;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f9f9f9;
  margin-bottom: 16px;
}

.empty-messages {
  text-align: center;
  color: #999;
  padding: 48px;
}

.message {
  margin-bottom: 16px;
  display: flex;
}

.message.sent {
  justify-content: flex-end;
}

.message.received {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
}

.message.sent .message-content {
  background-color: #9c27b0;
  color: white;
}

.message.received .message-content {
  background-color: white;
  color: #333;
  border: 1px solid #e0e0e0;
}

.message-content p {
  margin: 0 0 4px 0;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  display: block;
}

.message-input-container {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>

