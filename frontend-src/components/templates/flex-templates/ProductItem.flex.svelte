<script lang="ts">
    import ProductItemPreview from "./ProductItem.preview.flex.svelte";
    import { afterUpdate, onMount } from "svelte";
    import CropModal from "./CropModal.svelte";
    import type { TemplateFlexProductItem } from "../../../models/template.model";
    import { isDisableByActionAndLabel } from "../../../models/template.model";
    import sweetalert from "sweetalert2";
    import { getImageInfoByFile } from "../../../utils";
    import ActionWithLabel from "./ActionWithLabel.flex.svelte";

    export let id: string = "";
    let fileInput;
    let inputUploadId = `input-file-upload-${id}`;
    let previewImageUrl: string;
    let isModalOpen: boolean = false;

    export let item: TemplateFlexProductItem = {
        imageUrl: "",
        title: "",
        price: 0,
        description: "",
        action1: {
            label: "",
            type: "",
            text: "",
            url: "",
        },
        enabledAction1: false,
        enabledAction2: false,
        enabledDescription: false,
        enabledPrice: false,
        action2: {
            label: "",
            type: "",
            text: "",
            url: "",
        },
    };

    async function selectFile(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target?.files.length === 0) {
            return;
        }

        try {
            const file = target?.files[0];
            const imageInfo = await getImageInfoByFile(file);
            previewImageUrl = imageInfo.base64;
            isModalOpen = true;
        } catch (error) {
            sweetalert.fire({ icon: "error", title: error });
        }
    }

    function confirmCrop(croppedImage: string) {
        item.imageUrl = croppedImage;
    }

    onMount(() => {});
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

    afterUpdate(()=>{
        
    });
</script>

<section>
    <div class="tab-content py-3">
        <div class="row">
            <div class="col-auto">
                <ProductItemPreview {item} />
            </div>
            <div class="col">
                <div style="max-width: 800px;">
                    <div class="row mb-2">
                        <div class="col-3">
                            <span class="span-field"> 圖片 </span>
                        </div>
                        <div class="col">
                            <div class="mt-2">
                                <div class="d-inline-block">
                                    {#if item.imageUrl}
                                        <div class="d-flex block-product-image border position-relative">
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
                                            <div class="d-flex block-product-image border">
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
                            <span class="span-field"> 頁面標題 </span>
                        </div>
                        <div class="col">
                            <input bind:value={item.title} maxlength={20} type="text" class="form-control" />
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col-3">
                            <input bind:checked={item.enabledDescription} id="checkbox-flex-product-description-{id}" type="checkbox" class="form-check-input" />
                            <label class="form-check-label" for="checkbox-flex-product-description-{id}">文字說明</label>
                        </div>
                        <div class="col">
                            <textarea disabled={!item.enabledDescription} bind:value={item.description} maxlength="60" class="form-control" rows="5" placeholder="輸入文字說明" />
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col-3">
                            <input bind:checked={item.enabledPrice} id="checkbox-flex-product-price-{id}" type="checkbox" class="form-check-input" />
                            <label class="form-check-label" for="checkbox-flex-product-price-{id}">價格</label>
                        </div>
                        <div class="col">
                            <div class="row">
                                <div class="col-auto">
                                    <select disabled={true} class="form-select">
                                        <option value="NT $" selected> NT $ </option>
                                    </select>
                                </div>
                                <div class="col">
                                    <input disabled={!item.enabledPrice} bind:value={item.price} type="number" class="form-control" placeholder="00,000" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col-3">
                            <input bind:checked={item.enabledAction1} id="checkbox-flex-product-action-1-{id}" type="checkbox" class="form-check-input" />
                            <label class="form-check-label" for="checkbox-flex-product-action-1-{id}">動作</label>
                        </div>
                        <div class="col">
                            <input disabled={isDisableByActionAndLabel(item.action1, item.enabledAction1)} bind:value={item.action1.label} type="text" class="form-control" placeholder="輸入動作標籤的說明" />
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col-3">
                            <span class="span-field"> 類型 </span>
                        </div>
                        <div class="col">
                            <ActionWithLabel bind:enabledAction={item.enabledAction1} bind:action={item.action1} />
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col-3">
                            <input bind:checked={item.enabledAction2} id="checkbox-flex-product-action-2-{id}" type="checkbox" class="form-check-input" />
                            <label class="form-check-label" for="checkbox-flex-product-action-2-{id}">動作</label>
                        </div>
                        <div class="col">
                            <input disabled={isDisableByActionAndLabel(item.action2, item.enabledAction2)} bind:value={item.action2.label} type="text" class="form-control" placeholder="輸入動作標籤的說明" />
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col-3">
                            <span class="span-field"> 類型 </span>
                        </div>
                        <div class="col">
                            <ActionWithLabel bind:enabledAction={item.enabledAction2} bind:action={item.action2} />
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
    .block-product-image {
        width: 10rem;
        height: 10rem;
        align-items: center;
        align-self: center;
        text-align: center;
    }
    .block-product-image span {
        flex: 1;
    }
</style>
