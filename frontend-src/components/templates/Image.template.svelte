<script lang="ts">
    import type { TemplateImage } from "../../models/template.model";
    import sweetalert from "sweetalert2";
    import { getImageInfoByFile } from "../../utils";

    const d = new Date();
    export let id: string = d.getTime().toString();
    export let image: TemplateImage = { imageUrl: "", imageFile: null };
    export let isUpdated: boolean = false;
    let previewImageUrl: string = image?.imageUrl ?? "";
    let isSelectedImage: boolean = false;

    const inputUploadId = `file-template-${id}`;

    async function changeImage(event: Event) {
        const target = event.target as HTMLInputElement;

        if (target?.files.length === 0) {
            return;
        }

        try {
            isUpdated = true;
            const file = target?.files[0];
            const imageInfo = await getImageInfoByFile(file);
            previewImageUrl = imageInfo.base64;
            image = { imageUrl: "", imageFile: file };
            isSelectedImage = true;
            console.log(`changeImage `, image);
        } catch (error) {
            sweetalert.fire({ icon: "error", title: error });
        }
    }

    async function clickCancelSelectImage() {
        const confirmResult = await sweetalert.fire({ icon: "question", text: "確定要取消該圖片", showCancelButton: true, showConfirmButton: true });

        if (!confirmResult.isConfirmed) {
            return;
        }
        previewImageUrl = "";
        image = { imageUrl: "", imageFile: null };
        isSelectedImage = false;
        isUpdated = false;
    }
</script>

<div class="border p-5">
    {#if isSelectedImage || previewImageUrl}
        <div class="text-start">
            <div class="block-image-holder position-relative">
                <img class="w-100" src={previewImageUrl} alt="preview" />
                <button
                    on:click={() => {
                        clickCancelSelectImage();
                    }}
                    class="btn btn-outline-secondary position-absolute top-0 end-0"
                >
                    <i class="bi bi-x" />
                </button>
            </div>
        </div>
    {:else}
        <label for={inputUploadId} class="btn btn-outline-dark"> 上傳照片 </label>
        <br />
        <i class="bi bi-image fs-2 text-black-50" />
    {/if}

    <input
        on:change={(e) => {
            changeImage(e);
        }}
        id={inputUploadId}
        type="file"
        class="d-none"
        accept=".png,.jpg,.jpeg"
    />
</div>

<div class="form-text text-muted small text-start">檔案格式：JPG、JPEG、PNG<br />檔案容量：10MB以下</div>

<style>
    .block-image-holder {
        max-width: 10rem;
    }
</style>
