<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import Login from "../pages/Login.page.svelte";
  import ManagementLayout from "../layouts/ManagementLayout.svelte";
  import SharePage from "../pages/Share.page.svelte";
</script>

<Router url="" basepath="/">
  <Route path="/share/:code" let:params>
    <SharePage code={params.code} />
  </Route>
  <Route path="/share">
    <SharePage />
  </Route>
  <Route path="/login" component={Login} />
  <Route path="/management/*" component={ManagementLayout} />
  <Route path="/" component={ManagementLayout} />
</Router>
