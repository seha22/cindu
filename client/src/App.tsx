import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Programs from "@/pages/Programs";
import ProgramDetail from "@/pages/ProgramDetail";
import Articles from "@/pages/Articles";
import Sejarah from "@/pages/about/Sejarah";
import VisiMisi from "@/pages/about/VisiMisi";
import StrukturOrganisasi from "@/pages/about/StrukturOrganisasi";
import ProgramKami from "@/pages/about/ProgramKami";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminPrograms from "@/pages/admin/AdminPrograms";
import AdminArticles from "@/pages/admin/AdminArticles";
import AdminDonations from "@/pages/admin/AdminDonations";
import AdminCms from "@/pages/admin/AdminCms";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminReports from "@/pages/admin/AdminReports";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminProfile from "@/pages/admin/AdminProfile";
import Dashboard from "@/pages/dashboard/Dashboard";
import Profile from "@/pages/dashboard/Profile";
import DonationHistory from "@/pages/dashboard/DonationHistory";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import { Loader2 } from "lucide-react";

import AdminLogin from "@/pages/admin/AdminLogin";

type GuardedComponent = () => JSX.Element | null;

function AdminRoute({ component: Component }: { component: GuardedComponent }) {
  const { user, isLoading, isAdmin } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return <Redirect to="/admin/login" />;
  if (!isAdmin) return <Redirect to="/dashboard" />;
  return <Component />;
}

function UserRoute({ component: Component }: { component: GuardedComponent }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

function GuestRoute({ component: Component }: { component: GuardedComponent }) {
  const { user, isLoading, isAdmin } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (user) return <Redirect to={isAdmin ? "/admin" : "/dashboard"} />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/programs" component={Programs} />
      <Route path="/programs/:id" component={ProgramDetail} />
      <Route path="/articles" component={Articles} />
      <Route path="/about/sejarah" component={Sejarah} />
      <Route path="/about/visi-misi" component={VisiMisi} />
      <Route path="/about/struktur-organisasi" component={StrukturOrganisasi} />
      <Route path="/about/program" component={ProgramKami} />

      <Route path="/login">{() => <GuestRoute component={Login} />}</Route>
      <Route path="/admin/login">{() => <GuestRoute component={AdminLogin} />}</Route>
      <Route path="/register">{() => <GuestRoute component={Register} />}</Route>
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      <Route path="/admin">{() => <AdminRoute component={AdminDashboard} />}</Route>
      <Route path="/admin/programs">{() => <AdminRoute component={AdminPrograms} />}</Route>
      <Route path="/admin/articles">{() => <AdminRoute component={AdminArticles} />}</Route>
      <Route path="/admin/donations">{() => <AdminRoute component={AdminDonations} />}</Route>
      <Route path="/admin/users">{() => <AdminRoute component={AdminUsers} />}</Route>
      <Route path="/admin/reports">{() => <AdminRoute component={AdminReports} />}</Route>
      <Route path="/admin/cms">{() => <AdminRoute component={AdminCms} />}</Route>
      <Route path="/admin/settings">{() => <AdminRoute component={AdminSettings} />}</Route>
      <Route path="/admin/profile">{() => <AdminRoute component={AdminProfile} />}</Route>

      <Route path="/dashboard">{() => <UserRoute component={Dashboard} />}</Route>
      <Route path="/dashboard/profile">{() => <UserRoute component={Profile} />}</Route>
      <Route path="/dashboard/riwayat-donasi">{() => <UserRoute component={DonationHistory} />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
