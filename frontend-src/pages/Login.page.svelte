<script lang="ts">
    import { navigate } from "svelte-routing";
    import sweetalert from "sweetalert2";
    import { managementService } from "../services";

    let account: string = "";
    let password: string = "";

    async function login() {
        const result = await managementService.user.login({
            account,
            password,
        });

        if (result.success) {
            navigate("/management/audiences");
            return;
        }

        sweetalert.fire({ icon: "error", text: result?.error?.message });

        return;
    }

    function handleKeydown(event) {
        if (event.keyCode == 13) {
            login();
            return;
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="position-relative vh-100 login-container">
    <div class="position-absolute top-50 start-50 translate-middle">
        <div class="card shadow" style="min-width: 25rem;">
            <div class="card-body">
                <p class="text-center" />
                <h4 class="text-center">{process.env.APP_LOGIN_PAGE_NAME || ""}</h4>
                <h5 class="text-center">訊息推播平台</h5>
                <div class="mb-3">
                    <label for="input-email" class="form-label">帳號</label>
                    <input
                        type="email"
                        class="form-control"
                        id="input-email"
                        bind:value={account}
                        placeholder="name@example.com"
                    />
                </div>
                <div class="mb-3">
                    <label for="input-password" class="form-label">密碼 </label>
                    <input
                        type="password"
                        class="form-control"
                        bind:value={password}
                        id="input-password"
                    />
                </div>
                <div class="d-grid gap-2">
                    <input
                        on:click={login}
                        class="btn btn-primary"
                        type="button"
                        value="登入"
                    />
                </div>
            </div>
        </div>
    </div>
</div>
