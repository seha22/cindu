import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Programs from "@/pages/Programs";
import ProgramDetail from "@/pages/ProgramDetail";
import Articles from "@/pages/Articles";
import Sejarah from "@/pages/about/Sejarah";
import VisiMisi from "@/pages/about/VisiMisi";
import StrukturOrganisasi from "@/pages/about/StrukturOrganisasi";
import ProgramKami from "@/pages/about/ProgramKami";

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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
