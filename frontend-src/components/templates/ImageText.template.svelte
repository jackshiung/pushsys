<script lang="ts">
    import Modal from "sv-bootstrap-modal";
    import sweetalert from "sweetalert2";
    import PreviewBlock from "./image-text-template/PreviewBlock.imageText.svelte";
    import { ImageTextType } from "../../models/template.model";
    import type { TemplateImageText } from "../../models/template.model";
    import type { ImageInfo } from "../../models/file.vm";
    import { getImageInfoByFile } from "../../utils";
    export let isUpdated: boolean = false;
    export let id: string = new Date().getTime().toString();
    const inputUploadId = `file-template-${id}`;
    let previewBlock: ImageTextType = null;
    let fileInput;

    export let imageText: TemplateImageText = {
        type: null,
        actions: [
            {
                type: "",
                text: "",
                url: "",
            },
        ],
        title: "",
        imageUrl: "",
        imageFile: null,
        imageHeight: 0,
    };

    let previewImageUrl: string = imageText?.imageUrl ?? "";

    let isModalOpen: boolean = false;
    let templateSelected = false;
    let selectedTemplate: ImageTextType = null;

    let currentTemplate: TemplateInfo = null;

    type StrictSize = {
        minWidth: number;
        minHeight: number;
        maxWidth: number;
        maxHeight: number;
    };

    const rectangle: StrictSize = {
        minWidth: 1040,
        minHeight: 520,
        maxWidth: 1040,
        maxHeight: 2080,
    };

    const square: StrictSize = {
        minWidth: 1040,
        minHeight: 1040,
        maxWidth: 1040,
        maxHeight: 1040,
    };

    interface TemplateInfo {
        name: ImageTextType;
        sectionCount: number;
        strictSize: StrictSize;
    }

    const sectionConfigDic: Record<string, TemplateInfo> = {
        "text-image-custom": { name: ImageTextType.textImageCustom, sectionCount: 1, strictSize: rectangle },
        "text-image-1": { name: ImageTextType.textImage_1, sectionCount: 1, strictSize: square },
        "text-image-4": { name: ImageTextType.textImage_4, sectionCount: 4, strictSize: square },
        "text-image-vertical-2": { name: ImageTextType.textImageVertical_2, sectionCount: 2, strictSize: square },
        "text-image-cover-3": { name: ImageTextType.textImageCover_3, sectionCount: 3, strictSize: square },
        "text-image-horizon-2": { name: ImageTextType.textImageHorizon_2, sectionCount: 2, strictSize: square },
        "text-image-horizon-cover-3": { name: ImageTextType.textImageHorizonCover_3, sectionCount: 3, strictSize: square },
        "text-image-horizon-3": { name: ImageTextType.textImageHorizon_3, sectionCount: 3, strictSize: square },
        "text-image-rectangle-6": { name: ImageTextType.textImageRectangle_6, sectionCount: 6, strictSize: rectangle },
    };

    function clickBlockTemplate(template: ImageTextType) {
        templateSelected = true;
        selectedTemplate = template;
    }

    async function confirmSelect() {
        if (!templateSelected) {
            await sweetalert.fire({ icon: "error", text: "請選擇樣板" });
            return;
        }

        currentTemplate = sectionConfigDic[selectedTemplate];
        previewBlock = currentTemplate.name;
        imageText.type = currentTemplate.name;

        imageText.imageFile = null;
        previewImageUrl = "";
        fileInput.value = null;

        if (!currentTemplate) {
            await sweetalert.fire({ icon: "error", text: "查無樣板" });
            return;
        }

        if (imageText.actions.length === currentTemplate.sectionCount) {
            // do nothing
        } else if (imageText.actions.length > currentTemplate.sectionCount) {
            const deleteCount = imageText.actions.length - currentTemplate.sectionCount;
            imageText.actions = imageText.actions.slice(0, imageText.actions.length - deleteCount);
        } else {
            const addedCount = currentTemplate.sectionCount - imageText.actions.length;
            for (let i = 0; i < addedCount; i++) {
                imageText.actions.push({
                    type: "",
                    text: "",
                    url: "",
                });
            }
            imageText.actions = [...imageText.actions];
        }
        isModalOpen = false;
    }

    function getAlphabetByIndex(index: number): string {
        return String.fromCharCode(65 + index);
    }

    async function selectFile(event: Event) {
        const target = event.target as HTMLInputElement;

        if (target?.files.length === 0) {
            return;
        }

        try {
            const file = target?.files[0];
            const imageInfo = await getImageInfoByFile(file);

            verifyImageSize(imageInfo, currentTemplate.strictSize);

            isUpdated = true;
            imageText.imageFile = file;
            imageText.imageHeight = imageInfo.height;
            previewImageUrl = imageInfo.base64;
        } catch (error) {
            sweetalert.fire({ icon: "error", title: error });
        }
    }

    function verifyImageSize(imageInfo: ImageInfo, strictSize: StrictSize): boolean {
        if (imageInfo.height < strictSize.minHeight) {
            throw Error(getStrictMessage(strictSize));
        }

        if (imageInfo.width < strictSize.minWidth) {
            throw Error(getStrictMessage(strictSize));
        }

        if (imageInfo.width > strictSize.maxWidth) {
            throw Error(getStrictMessage(strictSize));
        }

        if (imageInfo.height > strictSize.maxHeight) {
            throw Error(getStrictMessage(strictSize));
        }

        return true;
    }

    function getStrictMessage(strictSize: StrictSize): string {
        let widthStrictText: string = `${strictSize.minWidth.toString()} px`;
        let heightStrictText: string = `${strictSize.minHeight.toString()} px`;

        if (strictSize.minWidth != strictSize.maxWidth) {
            widthStrictText = `${strictSize.minWidth.toString()} ~ ${strictSize.maxWidth.toString()} px`;
        }

        if (strictSize.minHeight != strictSize.maxHeight) {
            heightStrictText = `${strictSize.minHeight.toString()} ~ ${strictSize.maxHeight.toString()} px`;
        }

        return `圖片寬度須為 ${widthStrictText}, 高度須為 ${heightStrictText}`;
    }
</script>

<div class="border p-5 text-start">
    <div class="mb-4">
        <h4>標題</h4>

        <div>
            <input
                on:change={() => {
                    isUpdated = true;
                }}
                bind:value={imageText.title}
                type="text"
                class="form-control"
                maxlength="100"
            />
        </div>
    </div>

    <div class="mb-4">
        <h4>訊息設定</h4>
    </div>

    <div>
        <div class="row">
            <div style="width: 240px; padding: 0;">
                <div class="border w-100 d-flex justify-content-center align-items-center mb-2 position-relative" style="min-height: 240px">
                    {#if previewImageUrl !== ""}
                        <img src={previewImageUrl} alt="" class="w-100" />
                    {:else}
                        <div class="fs-tip fw-light">請選擇版型並上傳背景圖片。</div>
                    {/if}

                    <PreviewBlock imageTextType={previewBlock} />
                </div>
                <div class="d-grid gap-2">
                    <button
                        on:click={() => {
                            isModalOpen = true;
                        }}
                        class="btn btn-secondary">選擇版型</button
                    >
                    <label for={inputUploadId} class:disabled={currentTemplate === null} class="btn btn-secondary">上傳背景圖片</label>

                    <input
                        bind:this={fileInput}
                        on:change={(e) => {
                            selectFile(e);
                        }}
                        disabled={currentTemplate == null}
                        id={inputUploadId}
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        class="d-none"
                    />
                </div>
            </div>
            <div class="col">
                <div class="fs-5 mb-2">動作</div>

                {#each imageText.actions as action, index}
                    <div class="border d-grid gap-2 p-3 mb-2">
                        <div class="mb-2">{getAlphabetByIndex(index)}</div>
                        <div class="row">
                            <div class="col-3 text-end">類型</div>
                            <div class="col text-start">
                                <select bind:value={action.type} class="form-select">
                                    <option value="">請選擇</option>
                                    <option value="text">文字</option>
                                    <option value="url">連結</option>
                                </select>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-3 text-end cursor">
                                {#if action.type === "text"}
                                    文字
                                {:else if action.type === "url"}
                                    網址
                                {/if}
                            </div>

                            <div class="col">
                                {#if action.type === "text"}
                                    <textarea
                                        on:change={() => {
                                            isUpdated = true;
                                        }}
                                        bind:value={action.text}
                                        placeholder="輸入文字"
                                        class="form-control"
                                        rows="5"
                                        maxlength="100"
                                    />
                                    <span class="float-end text-muted fw-light"> {action.text.length} / 100 </span>
                                {:else if action.type === "url"}
                                    <input
                                        on:change={() => {
                                            isUpdated = true;
                                        }}
                                        bind:value={action.url}
                                        class="form-control"
                                        type="url"
                                        placeholder="輸入網址"
                                    />
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>

<Modal dialogClasses="modal-lg" backdrop={false} bind:open={isModalOpen}>
    <div class="modal-header">
        <h5 class="modal-title">選擇版型</h5>
        <button type="button" class="btn-close" on:click={() => (isModalOpen = false)} />
    </div>
    <div class="modal-body">
        <div class="container">
            <div class="row">
                <div class="col text-start">
                    <strong> 自訂 </strong>
                </div>
                <div class="col text-start">
                    <strong> 正方形 </strong>
                </div>
                <div class="col" />
                <div class="col" />
                <div class="col" />
            </div>

            <div class="row">
                <div class="col" style="max-width: 20%;">
                    <div
                        on:click={() => {
                            clickBlockTemplate(ImageTextType.textImageCustom);
                        }}
                        class="block-template d-flex flex-column h-100 "
                        class:selected={selectedTemplate === ImageTextType.textImageCustom}
                    >
                        <img class="w-100" src="/public/images/image-text/text-image-custom-1-3.png" alt="template" />
                        <img class="flex-grow-1" src="/public/images/image-text/text-image-custom-2-3.png" alt="template" />
                        <img class="w-100" src="/public/images/image-text/text-image-custom-3-3.png" alt="template" />
                    </div>
                </div>
                <div class="col">
                    <div
                        on:click={() => {
                            clickBlockTemplate(ImageTextType.textImage_1);
                        }}
                        class="block-template mb-2"
                        class:selected={selectedTemplate === ImageTextType.textImage_1}
                    >
                        <img class="w-100" src="/public/images/image-text/text-image-1.png" alt="template" />
                    </div>
                    <div
                        on:click={() => {
                            clickBlockTemplate(ImageTextType.textImage_4);
                        }}
                        class="block-template"
                        class:selected={selectedTemplate === ImageTextType.textImage_4}
                    >
                        <img class="w-100" src="/public/images/image-text/text-image-4.png" alt="template" />
                    </div>
                </div>
                <div class="col">
                    <div
                        on:click={() => {
                            clickBlockTemplate(ImageTextType.textImageVertical_2);
                        }}
                        class="block-template mb-2"
                        class:selected={selectedTemplate === ImageTextType.textImageVertical_2}
                    >
                        <img class="w-100" src="/public/images/image-text/text-image-vertical-2.png" alt="template" />
                    </div>
                    <div
                        on:click={() => {
                            clickBlockTemplate(ImageTextType.textImageCover_3);
                        }}
                        class="block-template"
                        class:selected={selectedTemplate === ImageTextType.textImageCover_3}
                    >
                        <img class="w-100" src="/public/images/image-text/text-image-cover-3.png" alt="template" />
                    </div>
                </div>
                <div class="col">
                    <div
                        on:click={() => {
                            clickBlockTemplate(ImageTextType.textImageHorizon_2);
                        }}
                        class="block-template mb-2"
                        class:selected={selectedTemplate === ImageTextType.textImageHorizon_2}
                    >
                        <img class="w-100" src="/public/images/image-text/text-image-horizon-2.png" alt="template" />
                    </div>
                    <div
                        on:click={() => {
                            clickBlockTemplate(ImageTextType.textImageHorizonCover_3);
                        }}
                        class="block-template"
                        class:selected={selectedTemplate === ImageTextType.textImageHorizonCover_3}
                    >
                        <img class="w-100" src="/public/images/image-text/text-image-horizon-cover-3.png" alt="template" />
                    </div>
                </div>

                <div class="col">
                    <div
                        on:click={() => {
                            clickBlockTemplate(ImageTextType.textImageHorizon_3);
                        }}
                        class="block-template mb-2"
                        class:selected={selectedTemplate === ImageTextType.textImageHorizon_3}
                    >
                        <img class="w-100" src="/public/images/image-text/text-image-horizon-3.png" alt="template" />
                    </div>
                    <div
                        on:click={() => {
                            clickBlockTemplate(ImageTextType.textImageRectangle_6);
                        }}
                        class="block-template"
                        class:selected={selectedTemplate === ImageTextType.textImageRectangle_6}
                    >
                        <img class="w-100" src="/public/images/image-text/text-image-rectangle-6.png" alt="template" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-footer">
        <button on:click={() => (isModalOpen = false)} type="button" class="btn btn-secondary">取消</button>
        <button
            disabled={!templateSelected}
            on:click={() => {
                confirmSelect();
            }}
            type="button"
            class="btn btn-primary">選擇</button
        >
    </div>
</Modal>

<style>
    .block-template.selected {
        border: 2px solid #0e6dfd;
        border-radius: 7px;
    }
</style>
