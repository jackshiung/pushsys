<script lang="ts">
    import type { TemplateFlexPersonItem } from "../../../models/template.model";
    export let item: TemplateFlexPersonItem;
</script>

<div class="me-4 w-100 d-inline-block" style=" max-width: 300px">
    <div class="w-100 card card-radius">
        <div style="min-height: 250px; min-width: 250px;">
            {#if item.imageUrl}
                <div class="p-5 pb-3">
                    <img class="w-100 circle-image" src={item.imageUrl} alt="preview" />
                </div>
            {:else}
                <div class="p-5 pb-3">
                    <img class="w-100 circle-image" src="/public/images/no_image_person_600_600.png" alt="preview" />
                </div>
            {/if}
        </div>
        <div class="card-body">
            <h5 class="text-center">{item.name ? item.name : "請輸入名稱"}</h5>
            {#if item.enabledDescription}
                <div class="fs-6">
                    {item.description ? item.description : "輸入文字說明"}
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
    /* .block-empty-image-holder {
        min-height: 200px;
        width: 300px;
        background-color: #9a9a9a;
    } */

    .circle-image {
        border-radius: 50%;
    }
</style>
