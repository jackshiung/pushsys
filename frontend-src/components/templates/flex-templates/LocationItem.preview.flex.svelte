<script lang="ts">
    import type { TemplateFlexLocationItem } from "../../../models/template.model";
    export let item: TemplateFlexLocationItem;
</script>

<div class="me-4 w-100 d-inline-block" style=" max-width: 300px">
    <div class="w-100 card card-radius">
        <div style="min-height: 250px; min-width: 250px;">
            {#if item.imageUrl}
                <img class="w-100" src={item.imageUrl} alt="preview" />
            {:else}
                <div class="block-empty-image-holder d-flex align-items-center justify-content-center">
                    A
                </div>
            {/if}
        </div>
        <div class="card-body">
            <h5>{item.title ? item.title : "請輸入標題"}</h5>
            {#if item.enabledAddressInfo}
                <div class="fs-6">
                    <i class="bi bi-geo-alt" />
                    {item.addressInfo.text ? item.addressInfo.text : "輸入地址"}
                </div>
            {/if}

            {#if item.enabledInfo}
                <div class="fs-6">
                    {#if item.info.type === "price"}
                        <i class="bi bi-currency-dollar" /> {item.info.text ? item.info.text : "請輸入資訊"}
                    {:else if item.info.type === "time"}
                        <i class="bi bi-clock" /> {item.info.text ? item.info.text : "請輸入資訊"}
                    {/if}
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
