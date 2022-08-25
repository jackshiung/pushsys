<script lang="ts">
    import type { TemplateVideo } from "../../models/template.model";
    import { getImageInfoByFile } from "../../utils";
    import sweetalert from "sweetalert2";

    const fileSizeLimitWithMB = 1;
    let fileInput;
    export let isUpdated: boolean = false;

    export let video: TemplateVideo = {
        url: "",
        imageUrl: "",
    };

    async function changeImage(event: Event) {
        const target = event.target as HTMLInputElement;

        if (target?.files.length === 0) {
            return;
        }

        try {
            isUpdated = true;
            const file = target?.files[0];
            const imageInfo = await getImageInfoByFile(file);

            if (file.size / 1048576 > fileSizeLimitWithMB) {
                sweetalert.fire({ icon: "error", title: "檔案錯誤", text: `檔案大小不能大於 ${fileSizeLimitWithMB} MB` });
                return;
            }

            video.imageUrl = imageInfo.base64;
            video.imageFile = file;

            video = { ...video };

            // previewImageUrl = imageInfo.base64;
            // image = { imageUrl: "", imageFile: file };
            // isSelectedImage = true;
            // console.log(`changeImage `, image);
        } catch (error) {
            sweetalert.fire({ icon: "error", title: error });
        }

        isUpdated = true;
    }

    async function clickCancelSelectImage() {
        const confirmResult = await sweetalert.fire({ icon: "question", text: "確定要取消該圖片", showCancelButton: true, showConfirmButton: true });

        if (!confirmResult.isConfirmed) {
            return;
        }

        video.imageUrl = "";
        video.imageFile = null;
        if (fileInput && fileInput.value) {
            fileInput.value = null;
        }
    }
</script>

<div class="border p-5 text-start">
    <section class="mb-5">
        <div class="row">
            <div class="fs-5 col-3">貼上影片網址</div>
            <div class="col">
                <input required class="form-control" type="url" bind:value={video.url} placeholder="https://example-video.com/demo.mp4" maxlength="500" />
            </div>
        </div>
    </section>
    <section>
        <div class="row">
            <div class="fs-5 col-3">上傳影片預覽圖(選填)</div>
            <div class="col">
                <div class="mb-4">
                    <input bind:this={fileInput} on:change={changeImage} class="form-control" type="file" accept=".png,.jpg,.jpeg" />
                </div>

                {#if video.imageUrl}
                    <div class="block-image-holder position-relative d-inline-block">
                        <img class="w-100" src={video.imageUrl} alt="preview" />
                        <button
                            on:click={() => {
                                clickCancelSelectImage();
                            }}
                            class="btn btn-outline-secondary position-absolute top-0 end-0"
                        >
                            <i class="bi bi-x" />
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </section>
</div>

<style>
    .block-image-holder {
        max-width: 200px;
    }
</style>
