<script lang="ts">
    import { afterUpdate } from "svelte";
    import { getEmptyFlexItemByFlexTypeId } from "../../models/template.model";
    import type { FlexTypeIds } from "../../models/template.model";
    import type { TemplateFlex } from "../../models/template.model";
    import FlexTabs from "./flex-templates/FlexTabs.svelte";
    import ProductItemFlex from "./flex-templates/ProductItem.flex.svelte";
    import PhotoItemFlex from "./flex-templates/PhotoItem.flex.svelte";
    import LocationItemFlex from "./flex-templates/LocationItem.flex.svelte";
    import PersonItemFlex from "./flex-templates/PersonItem.flex.svelte";
    import sweetalert from "sweetalert2";
    export let isUpdated: boolean = false;
    export let id: string = "";
    let currentTab: number = 0;

    export let flex: TemplateFlex = {
        items: [],
        type: null,
        title: "",
    };

    async function clickFlexType(type: FlexTypeIds) {
        if (flex.type === type) {
            return;
        }

        if (flex.type !== null) {
            const confirmResult = await sweetalert.fire({
                icon: "question",
                text: "確定要放棄此類型？",
                showCancelButton: true,
                showConfirmButton: true,
            });

            if (!confirmResult.isConfirmed) {
                return false;
            }
        }

        currentTab = 0;

        const item = getEmptyFlexItemByFlexTypeId(type as FlexTypeIds);

        flex.type = type;

        flex.items = [item as any];
    }

    afterUpdate(() => {
        isUpdated = true;
    });
</script>

<div class="border p-5 text-start">
    <section>
        <div class="fs-5">標題</div>
        <div class="row">
            <div class="col-3" />
            <div class="col">
                <input bind:value={flex.title} type="text" class="form-control" placeholder="輸入標題" maxlength="100" />
                <span class="float-end text-muted fw-light fs-tip">{flex.title.length} / 100</span>
                <div class="fw-light fs-tip text-muted">訊息標題將顯示於推播通知及聊天一覽中。</div>
            </div>
        </div>
    </section>
    <hr class="my-5" />
    <section class="mb-4">
        <div class="fs-5 mb-2" title="若設定多個頁面，所有頁面的長度都將調整為與最長的頁面一致（內容較簡短的頁面可能會呈現較多空白）。">頁面設定 <i class="bi bi-question-circle" /></div>
        <div class="row">
            <div class="col-3 text-end">頁面類型</div>
            <div class="col">
                <div class="row">
                    <div class="col-auto">
                        <div
                            class="text-center"
                            on:click={() => {
                                clickFlexType("product");
                            }}
                        >
                            <img class="img-thumbnail img-flex-type {flex.type == 'product' ? 'image-selected' : ''}" src="/public/images/flex/message_type_01.png" alt="message type" />
                            <br />
                            產品
                        </div>
                    </div>
                    <div class="col-auto">
                        <div
                            class="text-center"
                            on:click={() => {
                                clickFlexType("location");
                            }}
                        >
                            <img class="img-thumbnail img-flex-type {flex.type == 'location' ? 'image-selected' : ''}" src="/public/images/flex/message_type_02.png" alt="message type" />
                            <br />
                            地點
                        </div>
                    </div>
                    <div class="col-auto">
                        <div
                            class="text-center"
                            on:click={() => {
                                clickFlexType("person");
                            }}
                        >
                            <img class="img-thumbnail img-flex-type {flex.type == 'person' ? 'image-selected' : ''}" src="/public/images/flex/message_type_03.png" alt="message type" />
                            <br />
                            人物
                        </div>
                    </div>
                    <div class="col-auto">
                        <div
                            class="text-center"
                            on:click={() => {
                                clickFlexType("photo");
                            }}
                        >
                            <img class="img-thumbnail img-flex-type {flex.type == 'photo' ? 'image-selected' : ''}" src="/public/images/flex/message_type_04.png" alt="message type" />
                            <br />
                            圖片
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <hr class="my-5" />
    <section class="mb-4">
        <section>
            {#if flex.type !== null}
                <FlexTabs bind:type={flex.type} bind:currentTab bind:items={flex.items} />
            {/if}
        </section>

        {#if flex.type === "product"}
            <ProductItemFlex {id} bind:item={flex.items[currentTab]} />
        {:else if flex.type === "photo"}
            <PhotoItemFlex {id} bind:item={flex.items[currentTab]} />
        {:else if flex.type === "location"}
            <LocationItemFlex {id} bind:item={flex.items[currentTab]} />
        {:else if flex.type === "person"}
            <PersonItemFlex {id} bind:item={flex.items[currentTab]} />
        {/if}
    </section>
</div>

<style>
    .img-flex-type {
        max-width: 160px;
    }
    :global(.image-selected) {
        border: 2px solid #0e6dfd;
    }
    :global(.card-radius) {
        border-radius: 0.75rem;
        overflow: hidden;
    }
    :global(.btn-action) {
        color: #0e6dfd;
    }

    :global(.list-group-item.btn-action) {
        border: none;
    }
</style>
