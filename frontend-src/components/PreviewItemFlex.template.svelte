<script lang="ts">
    import type { TemplateFlex } from "../models/template.model";
    import ProductItemPreview from "./templates/flex-templates/ProductItem.preview.flex.svelte";
    import PhotoItemPreview from "./templates/flex-templates/PhotoItem.preview.flex.svelte";
    import PersonItemPreview from "./templates/flex-templates/PersonItem.preview.flex.svelte";
    import LocationItemPreview from "./templates/flex-templates/LocationItem.preview.flex.svelte";

    export let flex: TemplateFlex = null;
</script>

<div class="w-100 block-item">
    {#if flex.type === "product"}
        {#each flex.items as item}
            <ProductItemPreview {item} />
        {/each}
    {:else if flex.type === "location"}
        {#each flex.items as item}
            <LocationItemPreview {item} />
        {/each}
    {:else if flex.type === "person"}
        {#each flex.items as item}
            <PersonItemPreview {item} />
        {/each}
    {:else if flex.type === "photo"}
        {#each flex.items as item}
            <PhotoItemPreview {item} />
        {/each}
    {/if}
</div>

<style>
    .block-item {
        white-space: nowrap;
        overflow-x: auto;
    }
</style>
