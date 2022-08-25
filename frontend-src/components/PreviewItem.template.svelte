<script lang="ts">
    import { TemplateIds } from "../models/template.model";
    import type { TemplateItem } from "../models/template.model";
    import { getImageInfoByFile } from "../utils";
    import { afterUpdate, onMount } from "svelte";
    import { isEmpty } from "class-validator";
    import PreviewItemFlex from "./PreviewItemFlex.template.svelte";

    export let item: TemplateItem;
    let previewImageUrl: string = "";

    async function setPreviewImageUrlByItem(item: TemplateItem) {
        const handlerTypes = [TemplateIds.image, TemplateIds.imageText, TemplateIds.video];


        if (isEmpty(item)) {
            return;
        }

        if (!handlerTypes.includes(item.type)) {
            return;
        }

        if (item.type === TemplateIds.image) {
            if (item.image.imageUrl) {
                previewImageUrl = item.image.imageUrl;
                return;
            }

            if (item.image.imageFile) {
                const { base64 } = await getImageInfoByFile(item.image.imageFile);
                previewImageUrl = base64;
                return;
            }
        }

        if (item.type === TemplateIds.imageText) {
            if (item.imageText.imageUrl) {
                previewImageUrl = item.imageText.imageUrl;
                return;
            }

            if (item.imageText.imageFile) {
                const { base64 } = await getImageInfoByFile(item.imageText.imageFile);
                previewImageUrl = base64;
                return;
            }
        }

        if (item.type === TemplateIds.video) {
            previewImageUrl = item.video.imageUrl ? item.video.imageUrl : "/public/images/video_default.png";
            return;
        }
    }

    onMount(async () => {
        await setPreviewImageUrlByItem(item);
    });

    afterUpdate(async () => {
        await setPreviewImageUrlByItem(item);
    });
</script>

<div class="mb-2">
    {#if item}
        {#if item.type === TemplateIds.text}
            <div class="chat-item baloon">
                <div class="speech-bubble">
                    {#if item.text.text}
                        {@html item.text.text.replace(/\n/g, "<br />")}
                    {:else}
                        輸入文字
                    {/if}
                </div>
            </div>
        {:else if item.type === TemplateIds.image}
            <div>
                <img class="w-75 img-rounded" src={previewImageUrl} alt="preview" />
            </div>
        {:else if item.type === TemplateIds.imageText}
            <div>
                <img class="w-75 img-rounded" src={previewImageUrl} alt="preview" />
            </div>
        {:else if item.type === TemplateIds.video}
            <div>
                <img class="w-75 img-rounded" src={previewImageUrl} alt="preview" />
            </div>
        {:else if item.type === TemplateIds.flex}
            <div class="w-100">
                <PreviewItemFlex flex={item.flex} />
            </div>
        {/if}
    {/if}
</div>

<style>
    .img-rounded {
        border-radius: 0.75rem;
    }
    .chat-item.baloon {
        border-radius: 1rem;
        display: inline-block;
        background-color: #edeff0;
    }

    .speech-bubble {
        padding: 0.5rem 0.75rem;
        line-height: 1.25;
        text-align: left;
        color: #495057;
        position: relative;
        word-break: break-word;
        word-wrap: break-word;
    }

    .speech-bubble:after {
        content: "";
        position: absolute;
        left: 0;
        top: 0.75rem;
        width: 0;
        height: 0;
        border: 0.5rem solid transparent;
        border-right-color: #edeff0;
        border-left: 0;
        border-top: 0;
        margin-left: -0.375rem;
    }
</style>
