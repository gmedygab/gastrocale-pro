import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AppLayout from "@/components/Layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Recipes from "@/pages/Recipes";
import RecipeDetail from "@/pages/RecipeDetail";
import RecipeForm from "@/pages/RecipeForm";
import Ingredients from "@/pages/Ingredients";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/recipes" component={Recipes} />
            <Route path="/recipes/new" component={RecipeForm} />
            <Route path="/recipes/:id/edit">
              {(params) => <RecipeForm id={parseInt(params.id, 10)} />}
            </Route>
            <Route path="/recipes/:id">
              {(params) => <RecipeDetail id={parseInt(params.id, 10)} />}
            </Route>
            <Route path="/ingredients" component={Ingredients} />
            <Route path="/reports" component={Reports} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
