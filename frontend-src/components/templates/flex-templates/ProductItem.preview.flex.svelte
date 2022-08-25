<script lang="ts">
    import type { TemplateFlexProductItem } from "../../../models/template.model";
    import { parseCommaNumber } from "../../../utils";
    export let item: TemplateFlexProductItem;
</script>

<div class="me-3 w-100 d-inline-block" style="max-width: 300px">
    <div class="w-100 card card-radius">
        <div style="min-height: 250px; min-width: 250px;">
            {#if item.imageUrl}
                <img  class="w-100" src={item.imageUrl} alt="preview" />
            {:else}
                <div class="block-empty-image-holder d-flex align-items-center justify-content-center">A</div>
            {/if}
        </div>
        <div class="card-body">
            <h5>{item.title ? item.title : "請輸入標題"}</h5>
            {#if item.enabledDescription}
                <div class="fs-6">
                    {item.description ? item.description : "請輸入文字說明"}
                </div>
            {/if}

            {#if item.enabledPrice}
                <div class="fs-5 text-end">
                    NT ${item.price ? parseCommaNumber(item.price) : "00,000"}
                </div>
            {/if}
        </div>
        <ul class="list-group list-group-flush border-0 pb-1">
            {#if item.enabledAction1}
                <li class="list-group-item text-center btn-action">{item.action1.label ? item.action1.label : "請輸入按鈕"}</li>
            {/if}

            {#if item.enabledAction2}
                <li class="list-group-item text-center btn-action">{item.action2.label ? item.action2.label : "請輸入按鈕"}</li>
            {/if}
        </ul>
    </div>
</div>

<style>
    .block-empty-image-holder {
        min-height: 200px;
        width: 300px;
        background-color: #9a9a9a;
    }
</style>
