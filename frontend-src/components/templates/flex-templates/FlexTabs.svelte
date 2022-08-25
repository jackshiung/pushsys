<script lang="ts">
    import { getEmptyFlexItemByFlexTypeId } from "../../../models/template.model";
    import type { FlexTypeIds, TemplateFlexItem } from "../../../models/template.model";
    import sweetalert from "sweetalert2";

    export let currentTab: number = 0;
    export let type: FlexTypeIds = null;
    export let items: TemplateFlexItem[] = [];

    function clickAddPage() {
        if (!type) {
            return;
        }
        const item = getEmptyFlexItemByFlexTypeId(type);
        items.push(item);
        items = items;
    }

    function clickTab(index: number) {
        currentTab = index;
    }

    function clickCopy() {
        const item = { ...items[currentTab], imageFile: null };
        const newItem = JSON.parse(JSON.stringify(item));

        items.push(newItem);

        items = [...items];
    }

    async function clickRemove() {
        const confirm = await sweetalert.fire({
            icon: "question",
            text: "確定要刪除",
            showConfirmButton: true,
            showCancelButton: true,
        });

        if (!confirm.isConfirmed) {
            return;
        }

        items.splice(currentTab, 1);
        items = [...items];

        currentTab = 0;
    }

    function clickMoveToPreview() {
        const [item] = items.splice(currentTab, 1);
        items.splice(currentTab - 1, 0, item);
        items = [...items];
        currentTab -= 1;
    }

    function clickMoveToNext() {
        const [item] = items.splice(currentTab, 1);
        items.splice(currentTab + 1, 0, item);
        items = [...items];
        currentTab += 1;
    }
</script>

<div class="d-flex justify-content-between align-items-center nav-tabs my-4">
    <ul class="nav">
        {#each items as item, index}
            <li class="nav-item">
                <span
                    on:click={() => {
                        clickTab(index);
                    }}
                    class:active={index === currentTab}
                    class="nav-link">{index + 1}</span
                >
            </li>
        {/each}
    </ul>

    <div class="p-2" style="margin-top:-1rem;">
        <button
            disabled={type === null || type === undefined || items.length >= 10}
            on:click={() => {
                clickAddPage();
            }}
            class="btn btn-outline-dark">增加頁面</button
        >
    </div>
</div>

<div class="text-end my-2">
    <button
        disabled={items.length >= 9}
        on:click={() => {
            clickCopy();
        }}
        class="btn btn-light"
    >
        <i class="lar la-lg la-copy" />
    </button>
    <button
        on:click={() => {
            clickMoveToPreview();
        }}
        disabled={currentTab === 0}
        class="btn btn-light"
    >
        <i class="lar la-lg la-chevron-left" />
    </button>
    <button
        on:click={() => {
            clickMoveToNext();
        }}
        disabled={currentTab === items.length - 1}
        class="btn btn-light"
    >
        <i class="lar la-lg la-chevron-right" />
    </button>
    <button
        on:click={() => {
            clickRemove();
        }}
        disabled={items.length === 1}
        class="btn btn-light"
    >
        <i class="lar la-lg la-times" />
    </button>
</div>
