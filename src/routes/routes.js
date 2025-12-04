import DashboardLayout from "@/pages/Layout/DashboardLayout.vue";

import Dashboard from "@/pages/Dashboard.vue";
import UserProfile from "@/pages/UserProfile.vue";
import TableList from "@/pages/TableList.vue";
import Typography from "@/pages/Typography.vue";
import Icons from "@/pages/Icons.vue";
import Maps from "@/pages/Maps.vue";
import Notifications from "@/pages/Notifications.vue";
import UpgradeToPRO from "@/pages/UpgradeToPRO.vue";
import Login from "@/pages/Login.vue";
import SignUp from "@/pages/SignUp.vue";
import AdminLayout from "@/pages/Layout/AdminLayout.vue";
import AdminHome from "@/pages/AdminHome.vue";
import AdminTutorApprovals from "@/pages/AdminTutorApprovals.vue";
import AdminUsers from "@/pages/AdminUsers.vue";
import AdminMessages from "@/pages/AdminMessages.vue";
import AdminSchedule from "@/pages/AdminSchedule.vue";
import AdminEarnings from "@/pages/AdminEarnings.vue";
import TutorDashboard from "@/pages/TutorDashboard.vue";
import TutorRequests from "@/pages/TutorRequests.vue";
import TutorSchedule from "@/pages/TutorSchedule.vue";
import TutorMessages from "@/pages/TutorMessages.vue";
import TutorFeedback from "@/pages/TutorFeedback.vue";
import LearnerDashboard from "@/pages/LearnerDashboard.vue";
import LearnerRequests from "@/pages/LearnerRequests.vue";
import LearnerMessages from "@/pages/LearnerMessages.vue";
import LearnerSchedule from "@/pages/LearnerSchedule.vue";
import LearnerFeedback from "@/pages/LearnerFeedback.vue";
import AIRecommendation from "@/pages/AIRecommendation.vue";
import BrowseTutors from "@/pages/BrowseTutors.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/signup",
    name: "Sign Up",
    component: SignUp,
  },
  {
    path: "/admin",
    component: AdminLayout,
    redirect: "/admin/home",
    children: [
      {
        path: "home",
        name: "Admin Home",
        component: AdminHome,
      },
      {
        path: "approvals",
        name: "Requests",
        component: AdminTutorApprovals,
      },
      {
        path: "users",
        name: "The Users",
        component: AdminUsers,
      },
      {
        path: "messages",
        name: "Message",
        component: AdminMessages,
      },
      {
        path: "schedule",
        name: "Schedule",
        component: AdminSchedule,
      },
      {
        path: "earnings",
        name: "Total Earnings",
        component: AdminEarnings,
      },
    ],
  },
  {
    path: "/",
    component: DashboardLayout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: Dashboard,
      },
      {
        path: "user",
        name: "User Profile",
        component: UserProfile,
      },
      {
        path: "table",
        name: "Table List",
        component: TableList,
      },
      {
        path: "typography",
        name: "Typography",
        component: Typography,
      },
      {
        path: "icons",
        name: "Icons",
        component: Icons,
      },
      {
        path: "maps",
        name: "Maps",
        meta: {
          hideFooter: true,
        },
        component: Maps,
      },
      {
        path: "notifications",
        name: "Notifications",
        component: Notifications,
      },
      {
        path: "upgrade",
        name: "Upgrade to PRO",
        component: UpgradeToPRO,
      },
      // Tutor-specific routes
      {
        path: "tutor-dashboard",
        name: "Tutor Dashboard",
        component: TutorDashboard,
      },
      {
        path: "tutor-requests",
        name: "Requests",
        component: TutorRequests,
      },
      {
        path: "tutor-schedule",
        name: "Schedule",
        component: TutorSchedule,
      },
      {
        path: "tutor-messages",
        name: "Messages",
        component: TutorMessages,
      },
      {
        path: "tutor-feedback",
        name: "Feedback",
        component: TutorFeedback,
      },
      // Learner-specific routes
      {
        path: "learner-dashboard",
        name: "Learner Dashboard",
        component: LearnerDashboard,
      },
      {
        path: "learner-requests",
        name: "My Requests",
        component: LearnerRequests,
      },
      {
        path: "learner-messages",
        name: "Messages",
        component: LearnerMessages,
      },
      {
        path: "learner-schedule",
        name: "Schedule",
        component: LearnerSchedule,
      },
      {
        path: "learner-feedback",
        name: "Feedback",
        component: LearnerFeedback,
      },
      {
        path: "ai-recommendation",
        name: "AI Recommendation",
        component: AIRecommendation,
      },
      {
        path: "browse-tutors",
        name: "Browse All Tutors",
        component: BrowseTutors,
      },
    ],
  },
];

export default routes;
