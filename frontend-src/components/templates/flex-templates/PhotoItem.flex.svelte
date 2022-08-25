<script lang="ts">
    import ActionWithLabel from "./ActionWithLabel.flex.svelte";
    import { onMount } from "svelte";
    import { getEmptyFlexItemByFlexTypeId } from "../../../models/template.model";
    import type { TemplateFlexPhotoItem } from "../../../models/template.model";
    import { isDisableByActionAndLabel } from "../../../models/template.model";
    import { getImageInfoByFile } from "../../../utils";
    import CropModal from "./CropModal.svelte";
    import sweetalert from "sweetalert2";
    import PhotoItemPreview from "./PhotoItem.preview.flex.svelte";
    import Slogan from "../flex-templates/Slogan.svelte";

    export let id: string = "";
    export let item: TemplateFlexPhotoItem = getEmptyFlexItemByFlexTypeId("photo") as TemplateFlexPhotoItem;
    let fileInput;
    let inputUploadId = `input-file-upload-${id}`;
    let previewImageUrl: string;
    let isSelectedImage: boolean = false;
    let isModalOpen: boolean = false;

    async function selectFile(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target?.files.length === 0) {
            return;
        }

        try {
            const file = target?.files[0];
            const imageInfo = await getImageInfoByFile(file);
            previewImageUrl = imageInfo.base64;
            item.imageFile = file;
            isSelectedImage = true;
            isModalOpen = true;
        } catch (error) {
            sweetalert.fire({ icon: "error", title: error });
        }
    }

    function confirmCrop(croppedImage: string) {
        item.imageUrl = croppedImage;
    }

    onMount(() => {
        console.log(`photoItemFlex`, {
            item,
        });
    });
    
    async function clickCancelSelectImage() {
        const confirmResult = await sweetalert.fire({ icon: "question", text: "確定要取消該圖片", showCancelButton: true, showConfirmButton: true });

        if (!confirmResult.isConfirmed) {
            return;
        }

        previewImageUrl = "";
        item.imageFile = null;
        item.imageUrl = "";
        if (fileInput && fileInput.value) {
            fileInput.value = null;
        }
    }
</script>

<section>
    <div class="tab-content py-3">
        <div class="row">
            <div class="col-auto">
                <PhotoItemPreview {item} />
            </div>
            <div class="col">
                <div style="max-width: 800px;">
                    <div class="row mb-2">
                        <div class="col-3">
                            <input bind:checked={item.enabledSlogan} id="checkbox-flex-photo-slogan-1-{id}" type="checkbox" class="form-check-input" />
                            <label class="form-check-label" for="checkbox-flex-photo-slogan-1-{id}">宣傳標語</label>
                        </div>
                        <div class="col">
                            <input maxlength="12" disabled={!item.enabledSlogan} bind:value={item.slogan.text} type="text" class="form-control" placeholder="輸入宣傳標語" />
                            <Slogan disabled={!item.enabledSlogan} bind:currentSloganType={item.slogan.color} />
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col-3">
                            <span class="span-field"> 圖片 </span>
                        </div>
                        <div class="col">
                            <div class="mt-2">
                                <div class="d-inline-block">
                                    {#if item.imageUrl}
                                        <div class="d-flex block-photo-image border position-relative">
                                            <img class="w-100" src={item.imageUrl} alt="preview" />
                                            <button
                                                on:click={() => {
                                                    clickCancelSelectImage();
                                                }}
                                                class="btn btn-danger btn-sm position-absolute top-0 end-0"
                                            >
                                                <i class="bi bi-x" />
                                            </button>
                                        </div>
                                    {:else}
                                        <label for={inputUploadId}>
                                            <div class="d-flex block-photo-image border">
                                                <span class="text-primary"> 上傳圖片 </span>
                                            </div>
                                        </label>
                                        <input
                                            bind:this={fileInput}
                                            on:change={(e) => {
                                                selectFile(e);
                                            }}
                                            id={inputUploadId}
                                            type="file"
                                            accept=".png,.jpg,.jpeg"
                                            class="d-none"
                                        />
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col-3">
                            <input bind:checked={item.enabledAction} id="checkbox-flex-product-action-1-{id}" type="checkbox" class="form-check-input" />
                            <label class="form-check-label" for="checkbox-flex-product-action-1-{id}">動作</label>
                        </div>
                        <div class="col">
                            <input disabled={isDisableByActionAndLabel(item.action, item.enabledAction)} bind:value={item.action.label} type="text" class="form-control" placeholder="輸入動作標籤的說明" />
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col-3">
                            <span class="span-field"> 類型 </span>
                        </div>
                        <div class="col">
                            <ActionWithLabel bind:enabledAction={item.enabledAction} bind:action={item.action} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<CropModal bind:isModalOpen bind:croppedImage={previewImageUrl} {confirmCrop} />

<style>
    .span-field {
        margin-left: 20px;
    }
    .block-photo-image {
        width: 10rem;
        height: 10rem;
        align-items: center;
        align-self: center;
        text-align: center;
    }
    .block-photo-image span {
        flex: 1;
    }
</style>
