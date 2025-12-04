<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-card>
          <md-card-header data-background-color="purple">
            <h4 class="title">AI Recommendation</h4>
            <p class="category">Top-rated tutors recommended for you</p>
          </md-card-header>
          <md-card-content>
            <div v-if="recommendedTutors.length === 0" class="md-body-1">
              No recommended tutors at this time.
            </div>
            <div v-else class="md-layout md-gutter">
              <div
                v-for="tutor in recommendedTutors"
                :key="tutor.id"
                class="md-layout-item md-medium-size-100 md-size-33"
                style="margin-bottom: 24px"
              >
                <md-card>
                  <md-card-content>
                    <div style="text-align: center">
                      <md-avatar class="md-large" style="margin: 0 auto 16px">
                        <img
                          :src="tutor.profilePicture || tutor.profileImage || require('@/assets/img/faces/marc.jpg')"
                          alt="Tutor"
                        />
                      </md-avatar>
                      <h5 style="margin: 8px 0">{{ tutor.name }}</h5>
                      <div style="margin: 8px 0">
                        <md-icon
                          v-for="i in 5"
                          :key="i"
                          :style="{
                            color: i <= Math.round(tutor.rating) ? '#ffc107' : '#ddd',
                            fontSize: '16px',
                          }"
                        >
                          star
                        </md-icon>
                        <span style="margin-left: 4px">{{ tutor.rating.toFixed(1) }}</span>
                      </div>
                      <p style="color: #666; font-size: 14px; margin: 8px 0">
                        {{ tutor.sessions || 0 }} sessions
                      </p>
                      <div v-if="tutor.subjects" style="margin: 8px 0">
                        <span
                          v-for="(subject, idx) in tutor.subjects.split(',')"
                          :key="idx"
                          style="
                            display: inline-block;
                            background-color: #9c27b0;
                            color: white;
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-size: 12px;
                            margin-right: 4px;
                            margin-bottom: 4px;
                          "
                        >
                          {{ subject.trim() }}
                        </span>
                      </div>
                      <p
                        v-if="tutor.bio"
                        style="color: #666; font-size: 12px; margin: 8px 0; text-align: left"
                      >
                        {{ tutor.bio.substring(0, 100) }}{{ tutor.bio.length > 100 ? "..." : "" }}
                      </p>
                      <md-button
                        class="md-primary md-raised"
                        @click="requestTutor(tutor)"
                        style="margin-top: 16px"
                      >
                        Request Session
                      </md-button>
                    </div>
                  </md-card-content>
                </md-card>
              </div>
            </div>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentUser, getUsers } from "@/helpers/storage";

export default {
  name: "AIRecommendation",
  data() {
    return {
      recommendedTutors: [],
    };
  },
  created() {
    this.loadRecommendedTutors();
  },
  methods: {
    loadRecommendedTutors() {
      // Get all approved tutors
      const users = getUsers();
      const realTutors = users.filter(
        (u) => u.role === "tutor" && u.status === "approved"
      );

      // Add mock tutors for display
      const mockTutors = [
        {
          id: "mock-1",
          name: "Dr. Sarah Johnson",
          email: "sarah.johnson@example.com",
          role: "tutor",
          status: "approved",
          subjects: "Mathematics, Calculus, Linear Algebra",
          bio: "PhD in Mathematics with 10+ years of teaching experience. Specialized in advanced calculus and linear algebra.",
          rating: 4.9,
          sessions: 156,
          profileImage: null,
        },
        {
          id: "mock-2",
          name: "Prof. Michael Chen",
          email: "michael.chen@example.com",
          role: "tutor",
          status: "approved",
          subjects: "Physics, Quantum Mechanics",
          bio: "Professor of Physics with expertise in quantum mechanics and theoretical physics.",
          rating: 4.8,
          sessions: 203,
          profileImage: null,
        },
        {
          id: "mock-3",
          name: "Dr. Emily Rodriguez",
          email: "emily.rodriguez@example.com",
          role: "tutor",
          status: "approved",
          subjects: "English Literature, Writing",
          bio: "Published author and literature professor. Expert in creative writing and literary analysis.",
          rating: 4.9,
          sessions: 189,
          profileImage: null,
        },
        {
          id: "mock-4",
          name: "Dr. James Wilson",
          email: "james.wilson@example.com",
          role: "tutor",
          status: "approved",
          subjects: "Chemistry, Organic Chemistry",
          bio: "Chemistry professor with research background in organic chemistry and biochemistry.",
          rating: 4.7,
          sessions: 142,
          profileImage: null,
        },
        {
          id: "mock-5",
          name: "Ms. Lisa Anderson",
          email: "lisa.anderson@example.com",
          role: "tutor",
          status: "approved",
          subjects: "Computer Science, Programming",
          bio: "Software engineer and coding instructor. Expert in multiple programming languages.",
          rating: 4.8,
          sessions: 178,
          profileImage: null,
        },
      ];

      // Combine real and mock tutors
      const allTutors = [...realTutors, ...mockTutors];

      // Add default ratings and sessions for real tutors if not set
      const tutorsWithRatings = allTutors.map((tutor) => ({
        ...tutor,
        rating: tutor.rating || 4.5 + Math.random() * 0.5,
        sessions: tutor.sessions || Math.floor(Math.random() * 100) + 10,
      }));

      // Sort by rating (highest first) and take top 6
      this.recommendedTutors = tutorsWithRatings
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);
    },
    requestTutor(tutor) {
      // Navigate to requests page with tutor pre-selected
      this.$router.push({
        path: "/learner-requests",
        query: { tutorId: tutor.id },
      });
    },
  },
};
</script>

<style scoped>
.md-card {
  transition: transform 0.2s;
}

.md-card:hover {
  transform: translateY(-4px);
}
</style>

