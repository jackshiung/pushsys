<script lang="ts">
    import Pagination from "../components/Pagination.svelte";
    import { navigate } from "svelte-routing";
    import { onMount } from "svelte";
    import { managementService } from "../services";
    import type { Template } from "../services/template.svc";
    import { formatUnknownDate, tryGetInteger } from "../utils";
    import sweetalert from "sweetalert2";
    import PreviewTemplate from "../components/Preview.template.svelte";
    import { parseServiceMessagesToTemplateItems } from "../models/template.model";
    import type { TemplateItem } from "../models/template.model";

    let urlParams = new URLSearchParams(window.location.search);
    let index: number = tryGetInteger(urlParams.get("p"), 1);
    let size: number = tryGetInteger(urlParams.get("ps"), 10);

    let items: Template[] = [];
    let totalCount: number = 0;
    let previewItems: TemplateItem[] = null;
    let previewShow: boolean = false

    onMount(async () => {
        await getList();
    });

    async function getList() {
        urlParams.set("p", index.toString());
        urlParams.set("ps", size.toString());
        history.pushState({}, "", `${location.pathname}?${urlParams.toString()}`);

        const result = await managementService.template.getTemplates({
            index,
            size,
        });

        items = result.items;
        totalCount = result.page.dataAmount;
    }

    async function clickDeleteTemplate(id: number) {
        const confirmResult = await sweetalert.fire({ icon: "question", text: "確定刪除?", showConfirmButton: true, showCancelButton: true });

        if (!confirmResult.isConfirmed) {
            return;
        }

        await deleteTemplate(id);
    }

    async function deleteTemplate(id: number) {
        const result = await managementService.template.deleteTemplate(id.toString());

        if (!result.success) {
            sweetalert.fire({ icon: "error", text: result?.error?.message ?? "刪除發生錯誤" });
            return;
        }

        await getList();
    }

    async function clickPreview(id: number) {
        const result = await managementService.template.getTemplate(id.toString());

        if (!result.success) {
            sweetalert.fire({ icon: "error", text: result?.error?.message ?? "預覽發生錯誤" });
            return;
        }

        previewItems = result.item.messages.map((message) => parseServiceMessagesToTemplateItems(message));
        previewShow = true
    }
</script>

<div class="py-5">
    <h1>訊息模板</h1>

    <div>
        <div class="text-end mb-3">
            <button
                on:click={() => {
                    navigate("/management/create-template");
                }}
                class="btn btn-outline-dark">新增模板</button
            >
        </div>

        <table class="table table-bordered">
            <thead>
                <tr>                    
                    <td>名稱</td>
                    <td>建立時間</td>
                    <td style="width: 120px;">訊息模板代碼</td>
                    <td>操作</td>
                </tr>
            </thead>
            <tbody>
                {#each items as item}
                    <tr>                        
                        <td>{item.name}</td>
                        <td>
                            {formatUnknownDate(item.createDate)}
                        </td>
                        <td>{item.id}</td>
                        <td>
                            <button
                                on:click={() => {
                                    navigate(`/management/edit-template/${item.id}`);
                                }}
                                class="btn btn-outline-dark">編輯</button
                            >
                            <button
                                on:click={() => {
                                    clickPreview(item.id);
                                }}
                                class="btn btn-primary">快速預覽</button
                            >
                            <button
                                on:click={() => {
                                    clickDeleteTemplate(item.id);
                                }}
                                class="btn btn-danger">刪除</button
                            >
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <Pagination
            currentPageIndex={index}
            dataCount={totalCount}
            pageSize={size}
            onClickHandler={(i) => {
                index = i;
                getList();
                return;
            }}
        />
    </div>
</div>

{#if previewItems}
    <PreviewTemplate items={previewItems} bind:show={previewShow} />
{/if}
