import { Switch, Route, Router as WouterRouter } from "wouter";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Pipeline from "@/pages/Pipeline";
import Deals from "@/pages/Deals";
import DealDetail from "@/pages/DealDetail";
import Contacts from "@/pages/Contacts";
import ContactDetail from "@/pages/ContactDetail";
import Companies from "@/pages/Companies";
import CompanyDetail from "@/pages/CompanyDetail";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/pipeline" component={Pipeline} />
        <Route path="/deals" component={Deals} />
        <Route path="/deals/:id" component={DealDetail} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/contacts/:id" component={ContactDetail} />
        <Route path="/companies" component={Companies} />
        <Route path="/companies/:id" component={CompanyDetail} />
        <Route path="/analytics" component={Analytics} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <WouterRouter>
      <Router />
    </WouterRouter>
  );
}

export default App;
