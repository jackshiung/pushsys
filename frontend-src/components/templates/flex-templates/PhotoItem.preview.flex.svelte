<script lang="ts">
    import type { TemplateFlexPhotoItem } from "../../../models/template.model";
    import { sloganConfigs } from "../../../models/template.model";
    export let item: TemplateFlexPhotoItem;

    function getText(label: string) {
        if (label.length < 16) {
            return label;
        }

        return label.substring(0, 15) + "...";
    }

    function getColor(item: TemplateFlexPhotoItem) {
        const config = sloganConfigs.find((config) => config.type === item.slogan.color);        
        if (!config) {
            return sloganConfigs[0].text;
        }
        return config.text;
    }
    function getBackground(item: TemplateFlexPhotoItem) {
        const config = sloganConfigs.find((config) => config.type === item.slogan.color);

        if (!config) {
            return sloganConfigs[0].background;
        }
        return config.background;
    }
</script>

<div class="me-4 w-100 d-inline-block" style="max-width: 300px">
    <div class="w-100">
        <div class="position-relative">
            {#if item.imageUrl}
                <img class="w-100 preview-circle-image" src={item.imageUrl} alt="preview" />
            {:else}
                <img class="w-100 preview-circle-image" src="/public/images/no_image_924_600.png" alt="preview" />
            {/if}

            {#if item.enabledAction}
                <div style="bottom: 3rem;" class="block-label p-2 position-absolute start-50 translate-middle-x bg-secondary text-light">
                    {item.action.label ? getText(item.action.label) : "輸入動作標籤的說明"}
                </div>
            {/if}

            {#if item.enabledSlogan}
                <div class="position-absolute top-0 start-0 block-slogan" style="color: {getColor(item)}; background-color: {getBackground(item)}">
                    {item.slogan.text ? item.slogan.text : "請輸入宣傳標語"}
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .preview-circle-image {
        border-radius: 2rem;
    }
    .block-label {
        bottom: 3rem;
        border-radius: 1rem;
        word-break: keep-all;
    }
    .block-slogan {
        top: 1rem !important;
        left: 1rem !important;
        padding: 0 8px;
        border-radius: 12px;
    }
</style>
