<script lang="ts">
    import { onMount } from "svelte";
    import { managementService } from "../services";
    import sweetalert from "sweetalert2";
    import { navigate } from "svelte-routing";

    let file: File = null;
    let name: string = "";
    let buttonDisabled: boolean = false;

    onMount(() => {});

    async function selectFile(event: Event) {
        const target = event.target as HTMLInputElement;

        if (!target?.files[0]) {
            return;
        }
        file = target.files[0];
    }

    async function uploadFile() {
        if (!name) {
            throw new Error("請輸入名稱");
        }

        if (!file) {
            throw new Error("請選擇檔案");
        }

        const uploadResult = await managementService.target.upload({
            file,
            name,
        });

        if (!uploadResult.success) {
            throw new Error(uploadResult?.error?.message ?? "錯誤");
        }
    }

    async function clickUploadButton() {
        try {
            buttonDisabled = true;
            await uploadFile();
            navigate("/management/audiences");
        } catch (error) {
            await sweetalert.fire({
                icon: "error",
                text: error.message,
            });
        } finally {
            buttonDisabled = false;
        }
    }
</script>

<div>
    <h1>上傳受眾</h1>

    <div>
        <div class="mb-3">
            <label for="txt-audience-name" class="form-label">受眾清單名稱</label>
            <input bind:value={name} type="text" class="form-control" id="txt-audience-name" />
        </div>
        <div class="mb-3">
            <label for="file-upload-excel" class="form-label">選擇 Excel 檔案</label>
            <a target="blank" href="/public/excel/上傳受眾ID清單範例.xlsx"> 下載範例 </a>
            <input on:change={selectFile} accept=".xlsx,xls" class="form-control" type="file" id="file-upload-excel" />
        </div>

        <div>
            <button
                disabled={buttonDisabled}
                on:click={() => {
                    clickUploadButton();
                }}
                class="btn btn-primary"
            >
                上傳建立受眾
            </button>
        </div>
    </div>
</div>
