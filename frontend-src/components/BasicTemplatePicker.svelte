<script lang="ts">
    import TextTemplate from "./templates/Text.template.svelte";
    import { getIconClassName, getTitle, TemplateIds } from "../models/template.model";
    import type { TabConfig } from "../models/template.model";
    import type { TemplateItem } from "../models/template.model";
    export let templateItem: TemplateItem;

    let currentIndex = 0;

    const tabs: TabConfig[] = [
        {
            component: TextTemplate,
            templateId: TemplateIds.text,
        },
    ];

    function clickTab(index: number) {
        currentIndex = index;
    }
</script>

<ul class="nav nav-pills bg-light p-3">
    {#each tabs as tab, index}
        <li title={getTitle(tab.templateId)} class="nav-item">
            <button
                on:click={() => {
                    clickTab(index);
                }}
                class="nav-link {index === currentIndex ? 'active' : ''}"
                type="button"
            >
                <i class={getIconClassName(tab.templateId)} />
            </button>
        </li>
    {/each}
</ul>

<div class="tab-content">
    <div class="tab-pane pane-content active">
        {#if templateItem.type === TemplateIds.text}
            <TextTemplate bind:text={templateItem.text} />
        {/if}
    </div>
</div>

<style>
    .pane-content {
        text-align: center;
        border: rgb(208 208 208) 1px solid;
        padding: 1.25rem;
    }
</style>
