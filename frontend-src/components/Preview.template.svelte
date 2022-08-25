<script lang="ts">
    import { TemplateIds } from "../models/template.model";
    import type { TemplateItem } from "../models/template.model";
    import PreviewItem from "./PreviewItem.template.svelte";
    export let items: TemplateItem[] = [];
    export let show: boolean = true;
</script>

<div class="block-fixed">
    <div class="card" style="width: 25rem;">
        <div
            on:click={() => {
                show = !show;
            }}
            class="card-header"
        >
            {#if show}
                <i class="bi bi-arrow-down-short" />
            {:else}
                <i class="bi bi-arrow-up-short" />
            {/if}

            預覽
        </div>
        {#if show}
            <div class="card-body bg-message-preview">
                {#each items as item}
                    <div class="row">
                        <div class="col-2">
                            <img class="avatar" src="/public/images/no_image_person_600_600.png" alt="avatar" />
                        </div>
                        <div class={"col-10"}>
                            <div class="fs-6 text-light mb-2">iROO</div>
                            <div>
                                {#if item.type !== TemplateIds.flex}
                                    <PreviewItem {item} />
                                {/if}
                            </div>
                        </div>

                        {#if item.type === TemplateIds.flex}
                            <div class="col-12 my-2">
                                <PreviewItem {item} />
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
    }
    .block-fixed {
        position: fixed;
        right: 10rem;
        bottom: 0;
        z-index: 100;
    }
    .bg-message-preview {
        background-color: #666f86 !important;
        min-height: 540px;
        max-height: 600px;
        overflow-y: auto;
    }
</style>
