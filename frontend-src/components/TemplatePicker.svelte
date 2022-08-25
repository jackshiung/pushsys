<script lang="ts">
    import TextTemplate from "./templates/Text.template.svelte";
    import ImageTemplate from "./templates/Image.template.svelte";
    import ImageTextTemplate from "./templates/ImageText.template.svelte";
    import FlexTemplate from "./templates/Flex.template.svelte";
    import VideoTemplate from "./templates/Video.template.svelte";
    import { getIconClassName, getTitle, TemplateIds } from "../models/template.model";
    import type { TabConfig, TemplateItem } from "../models/template.model";
    import { onMount } from "svelte";
    import sweetalert from "sweetalert2";

    export let templateItem: TemplateItem;
    export let isUpdated: boolean = false;
    export let id: string = "";

    const tabs: TabConfig[] = [
        {
            component: TextTemplate,
            templateId: TemplateIds.text,
        },
        {
            component: ImageTemplate,
            templateId: TemplateIds.image,
        },
        {
            component: ImageTextTemplate,
            templateId: TemplateIds.imageText,
        },
        {
            component: FlexTemplate,
            templateId: TemplateIds.flex,
        },
        {
            component: VideoTemplate,
            templateId: TemplateIds.video,
        },
    ];

    async function clickTab(index: number) {
        if (isUpdated) {
            const confirmResult = await sweetalert.fire({ icon: "question", text: "確定要放棄目前的區塊?", showCancelButton: true, showConfirmButton: true });
            if (!confirmResult.isConfirmed) {
                return;
            }
        }

        isUpdated = false;

        templateItem.type = tabs[index].templateId;

        switch (templateItem.type) {
            case TemplateIds.text:
                templateItem.text = {
                    text: "",
                };
                break;
            case TemplateIds.image:
                templateItem.image = {
                    imageUrl: "",
                    imageFile: null,
                };
                break;
            case TemplateIds.imageText:
                templateItem.imageText = {
                    type: null,
                    title: "",
                    actions: [
                        {
                            type: "",
                            text: "",
                            url: "",
                        },
                    ],
                    imageUrl: "",
                    imageFile: null,
                    imageHeight: 0,
                };
                break;
            case TemplateIds.flex:
                templateItem.flex = {
                    type: null,
                    items: [],
                    title: "",
                };
                break;

            case TemplateIds.video:
                templateItem.video = {
                    url: "",
                    imageUrl: "",
                };
                break;
        }

        templateItem = { ...templateItem };
    }

    onMount(() => {});
</script>

<div>
    <ul class="nav nav-pills bg-light p-3">
        {#each tabs as tab, index}
            <li title={getTitle(tab.templateId)} class="nav-item">
                <button
                    on:click={() => {
                        clickTab(index);
                    }}
                    class="nav-link {tab.templateId === templateItem.type ? 'active' : ''}"
                    type="button"
                >
                    <i class={getIconClassName(tab.templateId)} />
                </button>
            </li>
        {/each}
    </ul>
    <div class="tab-content">
        <div class="tab-pane pane-content active">
            {#if templateItem}
                {#if templateItem.type === TemplateIds.text}
                    <TextTemplate bind:isUpdated bind:text={templateItem.text} />
                {:else if templateItem.type === TemplateIds.image}
                    <ImageTemplate bind:isUpdated bind:image={templateItem.image} />
                {:else if templateItem.type === TemplateIds.imageText}
                    <ImageTextTemplate bind:isUpdated bind:imageText={templateItem.imageText} />
                {:else if templateItem.type === TemplateIds.flex}
                    <FlexTemplate {id} bind:isUpdated bind:flex={templateItem.flex} />
                {:else if templateItem.type === TemplateIds.video}
                    <VideoTemplate bind:isUpdated bind:video={templateItem.video} />
                {/if}
            {/if}
        </div>
    </div>
</div>

<style>
    .pane-content {
        text-align: center;
        border: rgb(208 208 208) 1px solid;
        padding: 1.25rem;
    }

    :global(.fs-tip) {
        font-size: 0.85rem;
    }
    :global(.card-preview) {
        border-radius: 1.0625em;
        width: 18.75em;
        min-height: 10em;
    }
</style>
