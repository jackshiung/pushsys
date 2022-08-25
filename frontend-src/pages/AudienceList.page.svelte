<script lang="ts">
    import { onMount } from "svelte";
    import Pagination from "../components/Pagination.svelte";
    import { managementService } from "../services";
    import type { ISearchTargetAudienceGroupResult } from "../services/target.svc";
    import { formatUnknownDate, tryGetInteger } from "../utils";
    import { EnumSourceType } from "../services/target.svc";

    import sweetalert from "sweetalert2";
    import { navigate } from "svelte-routing";
    let urlParams = new URLSearchParams(window.location.search);
    let index: number = tryGetInteger(urlParams.get("p"), 1);
    let size: number = tryGetInteger(urlParams.get("ps"), 10);

    let totalCount: number = 0;
    let items: ISearchTargetAudienceGroupResult[] = [];
    onMount(async () => {
        await getList();
    });

    async function getList() {
        urlParams.set("p", index.toString());
        urlParams.set("ps", size.toString());
        history.pushState({}, "", `${location.pathname}?${urlParams.toString()}`);

        const result = await managementService.target.getTargetGroupList({
            index,
            size,
        });
        items = result.items;
        totalCount = result.page.dataAmount;
    }

    async function clickDeleteButton(id: string) {
        const confirmResult = await sweetalert.fire({
            icon: "question",
            text: "確定要刪除？",
            showCancelButton: true,
        });

        if (!confirmResult.isConfirmed) {
            return;
        }

        const deleteResult = await managementService.target.delete(id);

        if (!deleteResult.success) {
            sweetalert.fire({
                icon: "error",
                text: deleteResult?.error?.message ?? "刪除發生錯誤",
            });
            return;
        }

        await getList();
    }
</script>

<div>
    <h1>受眾清單</h1>

    <div class="text-end">

        <button on:click={()=>{
            navigate('/management/upload-audience')
        }} class="btn btn-secondary ms-2 my-2">
            上傳受眾
        </button>


        <button on:click={()=>{
            navigate('/management/create-audiences')
        }} class="btn btn-primary ms-2 my-2">
            新增受眾
        </button>
    </div>

    <div>
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th> 受眾編號 </th>
                    <th> 名稱 </th>

                    <th> 目標數 </th>

                    <th> 建立方式 </th>

                    <th> 建立時間 </th>

                    <th> 操作 </th>
                </tr>
            </thead>
            <tbody>
                {#each items as item}
                    <tr>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>
                            {item.taCount}
                        </td>
                        <td>
                            {#if item.sourceType === EnumSourceType.API}
                                {"API"}
                            {:else if item.sourceType === EnumSourceType.WEB}
                                {"後台"}
                            {/if}
                        </td>
                        <td>
                            {formatUnknownDate(item.createDate)}
                        </td>
                        <td>
                            <button
                                on:click={() => {
                                    navigate(`/management/push-message?target_id=${item.id}`);
                                    return;
                                }}
                                class="btn btn-outline-dark">發送推播</button
                            >
                            <a target="_blank" href={`/proxy/api/v1/management/ta/group/download/${item.id}`} class="btn btn-primary">打包下載 ID 名單</a>
                            <button
                                on:click={() => {
                                    clickDeleteButton(item.id.toString());
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
            onClickHandler={async (i) => {
                index = i;
                await getList();
                return;
            }}
        />
    </div>
</div>
