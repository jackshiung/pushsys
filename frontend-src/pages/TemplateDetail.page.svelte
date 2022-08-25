<script lang="ts">
    import TemplatePicker from "../components/TemplatePicker.svelte";
    import BasicTemplatePicker from "../components/BasicTemplatePicker.svelte";
    import sweetalert from "sweetalert2";
    import {
        parseServiceMessagesToTemplateItems,
        TemplateIds,
        validateFlexPerson,
        validateFlexProduct,
        validateFlexPhoto,
        validateFlexLocation,
        parseToTemplateMessage,
    } from "../models/template.model";
    import type { TemplateItem, TemplateFlex } from "../models/template.model";
    import { managementService } from "../services";
    import { navigate } from "svelte-routing";
    import { isEmpty, isURL } from "class-validator";
    import { afterUpdate, onMount } from "svelte";
    import PreviewTemplate from "../components/Preview.template.svelte";
    import ImageText from "../components/templates/ImageText.template.svelte";
    import Templates from "./Templates.page.svelte";
    let previewShow: boolean = false;

    let previewItems: TemplateItem[] = null;

    export let id: string = "";
    let mode: "edit" | "create" = "create";

    let basicTemplate: TemplateItem = {
        type: TemplateIds.text,
        text: {
            text: "",
        },
    };
    let addTemplates: TemplateItem[] = [];
    let isSaving: boolean = false;
    let name: string;
    let isUpdatedList: boolean[] = [];
    const maxTemplateCount: number = 2;

    async function clickAddTemplate() {
        addTemplates.push({
            type: TemplateIds.text,
            text: {
                text: "",
            },
        });
        isUpdatedList.push(false);
        isUpdatedList = [...isUpdatedList];
        addTemplates = [...addTemplates];
    }

    async function clickRemoveTemplate(id: number) {
        const confirmResult = await sweetalert.fire({
            icon: "question",
            text: "確定要移除此樣板?",
            showConfirmButton: true,
            showCancelButton: true,
        });

        if (!confirmResult.isConfirmed) {
            return;
        }
        addTemplates = addTemplates.filter((_, index) => index !== id);
        isUpdatedList = isUpdatedList.filter((_, index) => index !== id);
    }

    async function clickSave() {
        isSaving = true;
        try {
            // validate
            await validateTemplate();

            for (const template of addTemplates) {
                await uploadImageByTemplate(template);
            }

            const messages = await parseToTemplateMessage(
                basicTemplate,
                addTemplates
            );

            if (mode === "create") {
                const createResult =
                    await managementService.template.createTemplate({
                        name,
                        messages,
                    });

                if (!createResult.success) {
                    throw new Error(createResult.error?.message);
                }
            } else if (mode === "edit") {
                const updateResult =
                    await managementService.template.updateTemplate(id, {
                        name,
                        messages,
                    });

                if (!updateResult.success) {
                    throw new Error(updateResult.error?.message);
                }
            }

            navigate(`/management/templates`);
        } catch (error) {
            await sweetalert.fire({
                icon: "error",
                text: error?.message ?? "未知的錯誤",
            });
        } finally {
            isSaving = false;
        }
    }

    async function uploadImageByTemplate(item: TemplateItem) {
        switch (item.type) {
            case TemplateIds.image:
                if (item.image.imageFile) {
                    const uploadImage =
                        await managementService.file.uploadImage({
                            image: item.image.imageFile,
                        });
                    const url = uploadImage.item.location;
                    item.image.imageUrl = url;
                }

                break;

            case TemplateIds.imageText:
                if (item.imageText.imageFile) {
                    const uploadImageByImageText =
                        await managementService.file.uploadImage({
                            image: item.imageText.imageFile,
                        });
                    item.imageText.imageUrl =
                        uploadImageByImageText.item.location;
                }

                break;
            case TemplateIds.video:
                if (item.video.imageFile) {
                    const uploadImageByVideo =
                        await managementService.file.uploadImage({
                            image: item.video.imageFile,
                        });
                    item.video.imageUrl = uploadImageByVideo.item.location;
                }

                break;
        }
    }

    function validateTemplate() {
        if (!name) {
            throw new Error(`請輸入樣板名稱`);
        }

        const includingImageText = addTemplates.some(
            (item) => item.type === TemplateIds.imageText
        );

        let includingShare: boolean = false;

        for (const item of addTemplates) {
            if (item.type !== TemplateIds.flex) {
                continue;
            }

            switch (item.flex.type) {
                case "location":
                    includingShare = item.flex.items.some(
                        (item) =>
                            (item.enabledAction1 &&
                                item.action1.type === "share") ||
                            (item.enabledAction2 &&
                                item.action2.type === "share")
                    );
                    break;
                case "photo":
                    includingShare = item.flex.items.some(
                        (item) =>
                            item.enabledAction && item.action.type === "share"
                    );
                    break;
                case "person":
                    includingShare = item.flex.items.some(
                        (item) =>
                            (item.enabledAction1 &&
                                item.action1.type === "share") ||
                            (item.enabledAction2 &&
                                item.action2.type === "share")
                    );
                    break;
                case "product":
                    includingShare = item.flex.items.some(
                        (item) =>
                            (item.enabledAction1 &&
                                item.action1.type === "share") ||
                            (item.enabledAction2 &&
                                item.action2.type === "share")
                    );
                    break;
            }

            if (includingShare) {
                break;
            }
        }

        if (includingShare && includingImageText) {
            throw new Error(`若有圖文訊息則無法使用"分享"功能`);
        }

        validateTemplateItem(basicTemplate, "基本訊息區塊");

        for (let i = 2; i < addTemplates.length + 2; i++) {
            const item = addTemplates[i - 2];
            validateTemplateItem(item, `區塊 ${i} `);
        }
    }

    function validateTemplateItem(item: TemplateItem, sectionText: string) {
        switch (item.type) {
            case TemplateIds.text:
                if (isEmpty(item.text.text)) {
                    throw new Error(`${sectionText}錯誤：請輸入區塊文字訊息`);
                }
                break;
            case TemplateIds.image:
                if (isEmpty(item.image.imageUrl)) {
                    if (isEmpty(item.image.imageFile)) {
                        throw new Error(`${sectionText}錯誤：請選擇圖片`);
                    }
                }
                break;

            case TemplateIds.imageText:
                if (isEmpty(item.imageText.type)) {
                    throw new Error(`${sectionText}錯誤：請選擇樣式`);
                }

                if (isEmpty(item.imageText.title)) {
                    throw new Error(`${sectionText}錯誤：請輸入標題`);
                }

                if (item.imageText.actions.length === 0) {
                    throw new Error(`${sectionText}錯誤：錯誤的 Actions`);
                }

                if (isEmpty(item.imageText.imageUrl)) {
                    if (isEmpty(item.imageText.imageFile)) {
                        throw new Error(`${sectionText}錯誤：請選擇圖片`);
                    }
                }

                for (const action of item.imageText.actions) {
                    if (isEmpty(action.type)) {
                        throw new Error(`${sectionText}錯誤：請選擇區塊行為`);
                    }

                    if (action.type === "text") {
                        if (isEmpty(action.text.trim())) {
                            throw new Error(`${sectionText}錯誤：請輸入文字`);
                        }
                    }

                    if (action.type === "url") {
                        if (!isURL(action.url.trim())) {
                            throw new Error(`${sectionText}錯誤：請輸入連結`);
                        }
                    }
                }

                break;

            case TemplateIds.flex:
                validateFlex(item.flex, sectionText);
                break;
            case TemplateIds.video:
                if (!isURL(item.video.url)) {
                    throw new Error(`${sectionText}錯誤：請填入影片連結`);
                }
                break;
        }
    }

    function validateFlex(item: TemplateFlex, sectionText: string) {
        switch (item.type) {
            case "photo":
                validateFlexPhoto(item, sectionText);
                break;
            case "location":
                validateFlexLocation(item, sectionText);
                break;
            case "person":
                validateFlexPerson(item, sectionText);
                break;
            case "product":
                validateFlexProduct(item, sectionText);
                break;
        }
    }

    onMount(async () => {
        mode = isEmpty(id) ? "create" : "edit";

        if (mode === "edit") {
            const getTemplateResult =
                await managementService.template.getTemplate(id);
            const template = getTemplateResult.item;

            // set data
            name = template.name;
            const [basic, ...addItems] = template.messages.map((item) =>
                parseServiceMessagesToTemplateItems(item)
            );
            console.log(`===== TemplateDetailPage `, { basic, addItems });

            isUpdatedList = addItems.map((_) => true);
            basicTemplate = basic;
            addTemplates = addItems;
        }
    });

    afterUpdate(() => {
        previewItems = [basicTemplate, ...addTemplates];
    });
</script>

<div class="mb-5">
    <h1>
        {#if mode === "create"}
            新增模板
        {:else}
            編輯模板
        {/if}
    </h1>

    <div>
        <div class="mb-3">
            <h4>
                <label for="txt-template-name" class="form-label"
                    >模板名稱</label
                >
            </h4>

            <input
                bind:value={name}
                id="txt-template-name"
                type="text"
                class="form-control"
            />
        </div>

        <div class="mb-3">
            <h4>基本訊息</h4>

            <div>
                <BasicTemplatePicker bind:templateItem={basicTemplate} />
            </div>
        </div>

        {#each addTemplates as template, index}
            <div class="mb-3">
                <h4 class="clearfix">
                    <span>
                        訊息 {index + 2}
                    </span>

                    <span class="float-end">
                        <button
                            on:click={async () => {
                                clickRemoveTemplate(index);
                            }}
                            class="btn btn-light "
                        >
                            <i class="bi bi-trash" />
                        </button>
                    </span>
                </h4>

                <TemplatePicker
                    id={(index + 2).toString()}
                    bind:isUpdated={isUpdatedList[index]}
                    bind:templateItem={template}
                />
            </div>
        {/each}

        <div class="mb-3">
            <div class="d-grid gap-2">
                <button
                    disabled={addTemplates.length >= maxTemplateCount}
                    on:click={() => {
                        clickAddTemplate();
                    }}
                    class="btn btn-outline-secondary btn-lg"
                    type="button"
                >
                    <i class="bi bi-plus-circle" /> 增加樣板
                </button>

                <button
                    disabled={isSaving}
                    on:click={() => {
                        clickSave();
                    }}
                    class="btn btn-primary btn-lg"
                    type="button"
                >
                    送出
                </button>
            </div>
        </div>
    </div>
</div>

<PreviewTemplate items={previewItems} bind:show={previewShow} />
