<script lang="ts">
    import Menu from "../components/Menu.svelte";
    import { Router, Route } from "svelte-routing";
    import UploadAudiencePage from "../pages/UploadAudience.page.svelte";
    import AudienceListPage from "../pages/AudienceList.page.svelte";
    import PushMessagePage from "../pages/PushMessage.page.svelte";
    import MessagesListPage from "../pages/MessagesList.page.svelte";
    import TemplatesPage from "../pages/Templates.page.svelte";
    import TemplateDetailPage from "../pages/TemplateDetail.page.svelte";
    import CreateAudiencesPage from "../pages/CreateAudiences.page.svelte";
    import SubscribersPage from "../pages/Subscribers.page.svelte";
</script>

<Router>
    <main>
        <nav class="navbar navbar-light bg-light shadow-sm">
            <div class="container-fluid">
                <span class="navbar-brand mb-0 h1"> {process.env.APP_ADMIN_NAME || "訊息推播平台"} </span>
            </div>
        </nav>
        <div class="container-full">
            <div class="row">
                <div class="col-md-3 col-lg-2 d-md-block bg-light sidebar">
                    <Menu />
                </div>
                <div class="col-md-9 ms-sm-auto col-lg-10 px-md-4 block-content">
                    <Route path="/upload-audience" component={UploadAudiencePage} />
                    <Route path="/create-audiences" component={CreateAudiencesPage} />
                    <Route path="/audiences" component={AudienceListPage} />
                    <Route path="/push-message" component={PushMessagePage} />
                    <Route path="/messages-list" component={MessagesListPage} />
                    <Route path="/templates" component={TemplatesPage} />
                    <Route path="/create-template" component={TemplateDetailPage} />
                    <Route path="/subscribers" component={SubscribersPage} />
                    <Route path="/edit-template/:id" let:params>
                        <TemplateDetailPage id={params.id} />
                    </Route>
                    <Route path="/" component={AudienceListPage} />
                </div>
            </div>
        </div>
    </main>
</Router>

<style>
    .block-content {
        padding: 20px 10px 0 10px;
    }
    .sidebar {
        min-height: 100vh;
        box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.1);
        padding: 20px 10px 0 10px;
    }

    @media (max-width: 767.98px) {
        .sidebar {
            height: auto;
            min-height: auto;
            max-height: 100vh;
        }
    }
</style>
