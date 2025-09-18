import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Watch from "@/pages/watch";
import Channel from "@/pages/channel";
import Upload from "@/pages/upload";
import CreateChannel from "@/pages/create-channel";
import Trending from "@/pages/trending";
import Category from "@/pages/category";
import Search from "@/pages/search";
import Liked from "@/pages/liked";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/home" component={Home} />
      <Route path="/watch/:id" component={Watch} />
      <Route path="/channel/:id" component={Channel} />
      <Route path="/upload" component={Upload} />
      <Route path="/create-channel" component={CreateChannel} />
      <Route path="/trending" component={Trending} />
      <Route path="/category/:name" component={Category} />
      <Route path="/search/:query" component={Search} />
      <Route path="/liked" component={Liked} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
