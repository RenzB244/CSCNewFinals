// Simple localStorage-based auth/user management

const USERS_KEY = "app_users";
const CURRENT_USER_KEY = "app_current_user";

function loadUsers() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse users from storage", e);
    return [];
  }
}

function saveUsers(users) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function ensureDefaultAdmin() {
  const users = loadUsers();
  const hasAdmin = users.some((u) => u.role === "admin");
  if (!hasAdmin) {
    users.push({
      id: Date.now().toString() + "-admin",
      name: "Admin",
      email: "admin@example.com",
      password: "admin",
      role: "admin",
      status: "approved",
    });
    saveUsers(users);
  }
}

ensureDefaultAdmin();

export function getUsers() {
  return loadUsers();
}

export { saveUsers };

export function deleteUser(userId) {
  const users = loadUsers();
  const filtered = users.filter((u) => u.id !== userId);
  saveUsers(filtered);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(null);
  }

  return filtered;
}

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse current user", e);
    return null;
  }
}

export function setCurrentUser(user) {
  if (typeof window === "undefined") {
    return;
  }
  if (!user) {
    window.localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

export function registerUser({
  name,
  email,
  password,
  role,
  credentials,
  credentialImage,
  paymentStatus,
  transactionId,
}) {
  const users = loadUsers();
  const existing = users.find((u) => u.email === email);
  if (existing) {
    throw new Error("Email already in use");
  }

  const isTutor = role === "tutor";
  const user = {
    id: Date.now().toString(),
    name,
    email,
    password,
    role: isTutor ? "tutor" : "user",
    credentials: isTutor ? credentials : null,
    credentialImage: isTutor ? credentialImage || null : null,
    status: isTutor ? "pending" : "approved",
    paymentStatus: paymentStatus || "unpaid",
    transactionId: transactionId || null,
  };

  users.push(user);
  saveUsers(users);
  
  // Record payment if paid
  if (paymentStatus === "paid") {
    recordPayment({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      amount: PAYMENT_AMOUNT,
    });
  }
  
  return user;
}

export function loginUser({ email, password }) {
  const users = loadUsers();

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Allow pending tutors to log in but they can only access home page
  // No error thrown - they can log in but will be restricted by router guard

  setCurrentUser(user);
  return user;
}

export function logoutUser() {
  setCurrentUser(null);
}

export function getPendingTutors() {
  return loadUsers().filter(
    (u) => u.role === "tutor" && u.status === "pending"
  );
}

export function approveTutor(userId) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return null;
  }
  users[idx] = {
    ...users[idx],
    status: "approved",
  };
  saveUsers(users);
  return users[idx];
}

export function rejectTutor(userId) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return null;
  }
  users[idx] = {
    ...users[idx],
    status: "rejected",
  };
  saveUsers(users);
  return users[idx];
}

export function updateTutorProfile(userId, profileData) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return null;
  }
  users[idx] = {
    ...users[idx],
    ...profileData,
  };
  saveUsers(users);
  
  // Update current user if it's the same user
  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(users[idx]);
  }
  
  return users[idx];
}

const ACCEPTED_REQUESTS_KEY = "app_accepted_requests";
const MESSAGES_KEY = "app_messages";

function loadAcceptedRequests() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(ACCEPTED_REQUESTS_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveAcceptedRequests(requests) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(ACCEPTED_REQUESTS_KEY, JSON.stringify(requests));
}

export function getAcceptedRequests(tutorId) {
  return loadAcceptedRequests().filter((r) => r.tutorId === tutorId);
}

export function acceptTutoringRequest(request) {
  const requests = loadAcceptedRequests();
  const existing = requests.find(
    (r) => r.id === request.id && r.tutorId === request.tutorId
  );
  if (!existing) {
    requests.push({
      ...request,
      acceptedAt: new Date().toISOString(),
    });
    saveAcceptedRequests(requests);
  }
  return requests;
}

export function getMessages(tutorId) {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(MESSAGES_KEY);
    if (!raw) {
      return [];
    }
    const allMessages = JSON.parse(raw);
    // Only return messages for accepted requests
    const acceptedRequests = getAcceptedRequests(tutorId);
    const acceptedStudentIds = acceptedRequests.map((r) => r.studentId || r.studentName);
    return allMessages.filter(
      (m) => m.tutorId === tutorId && acceptedStudentIds.includes(m.studentId || m.studentName)
    );
  } catch (e) {
    return [];
  }
}

export function getLearnerMessages(studentId) {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(MESSAGES_KEY);
    if (!raw) {
      return [];
    }
    const allMessages = JSON.parse(raw);
    return allMessages.filter(
      (m) => (m.studentId || m.studentName) === studentId
    );
  } catch (e) {
    return [];
  }
}

export function addMessage(message) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const raw = window.localStorage.getItem(MESSAGES_KEY);
    const messages = raw ? JSON.parse(raw) : [];
    messages.push({
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    });
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to save message", e);
  }
}

// Payment management
const PAYMENTS_KEY = "app_payments";
const PAYMENT_AMOUNT = 50;

function loadPayments() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(PAYMENTS_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function savePayments(payments) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

export function recordPayment({ userId, userName, userEmail, userRole, amount }) {
  const payments = loadPayments();
  payments.push({
    id: Date.now().toString(),
    userId,
    userName,
    userEmail,
    userRole,
    amount: amount || PAYMENT_AMOUNT,
    date: new Date().toISOString(),
  });
  savePayments(payments);
  
  // Update user payment status
  const users = loadUsers();
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].paymentStatus = "paid";
    saveUsers(users);
  }
}

export function getTotalEarnings() {
  const payments = loadPayments();
  return payments.reduce((total, payment) => total + (payment.amount || PAYMENT_AMOUNT), 0);
}

export function getAllPayments() {
  return loadPayments();
}

// Admin messages
const ADMIN_MESSAGES_KEY = "app_admin_messages";

function loadAdminMessages() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(ADMIN_MESSAGES_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveAdminMessages(messages) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(ADMIN_MESSAGES_KEY, JSON.stringify(messages));
}

export function sendMessageToAdmin({ senderId, senderName, senderEmail, text }) {
  const messages = loadAdminMessages();
  messages.push({
    id: Date.now().toString(),
    senderId,
    senderName,
    senderEmail,
    text,
    timestamp: new Date().toISOString(),
  });
  saveAdminMessages(messages);
}

export function getAdminMessages() {
  return loadAdminMessages().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// All sessions for admin
export function getAllSessions() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(ACCEPTED_REQUESTS_KEY);
    if (!raw) {
      return [];
    }
    const allRequests = JSON.parse(raw);
    return allRequests.map((request) => {
      let dateTime;
      if (request.preferredDate) {
        const dateStr = request.preferredDate;
        const timeStr = request.preferredTime || "14:00";
        dateTime = new Date(`${dateStr}T${timeStr}`);
      } else {
        dateTime = new Date();
        dateTime.setDate(dateTime.getDate() + 1);
        dateTime.setHours(14, 0, 0, 0);
      }

      return {
        id: request.id,
        tutorName: request.tutorName || "Unknown",
        studentName: request.studentName || "Unknown",
        subject: request.subject,
        dateTime: dateTime,
      };
    }).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  } catch (e) {
    return [];
  }
}

