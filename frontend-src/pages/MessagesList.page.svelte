<script lang="ts">
    import { onMount } from "svelte";
    import Pagination from "../components/Pagination.svelte";
    import { managementService } from "../services";
    import type { ISearchTaskResult } from "../services/notification.svc";
    import { EnumTaskStatus } from "../services/notification.svc";
    import sweetalert from "sweetalert2";
    import { formatUnknownDate, tryGetInteger } from "../utils";
    import Modal from "sv-bootstrap-modal";
    import PreviewTemplate from "../components/Preview.template.svelte";
    import { parseServiceMessagesToTemplateItems } from "../models/template.model";
    import type { TemplateItem } from "../models/template.model";

    let urlParams = new URLSearchParams(window.location.search);
    let index: number = tryGetInteger(urlParams.get("p"), 1);
    let size: number = tryGetInteger(urlParams.get("ps"), 10);
    let totalCount = 0;
    let items: ISearchTaskResult[] = [];
    let isModalOpen: boolean = false;
    let modalTask: ISearchTaskResult = null;
    let canceling: boolean = false;
    let previewItems: TemplateItem[] = null;
    let previewShow: boolean = false

    onMount(async () => {
        await getList();
    });

    async function getList() {
        urlParams.set("p", index.toString());
        urlParams.set("ps", size.toString());
        history.pushState({}, "", `${location.pathname}?${urlParams.toString()}`);

        const listResult = await managementService.notification.getTasks({
            index,
            size,
        });

        if (!listResult.success) {
            await sweetalert.fire({
                icon: "error",
                text: listResult?.error?.message ?? "取得資料錯誤",
            });
            return;
        }

        totalCount = listResult.page.dataAmount;
        items = [...listResult.items];
    }

    function getStatusText(status: EnumTaskStatus) {
        switch (status) {
            case EnumTaskStatus.Canceled:
                return "已取消";
            case EnumTaskStatus.Pending:
                return "已排程";
            case EnumTaskStatus.Processing:
                return "處理中";
            case EnumTaskStatus.Completed:
                return "已完成";
            default:
                return "草稿中";
        }
    }

    async function clickDetailButton(id: number) {
        isModalOpen = true;
        const result = await managementService.notification.getTask(id.toString());
        modalTask = result.item;
    }

    async function clickCancelButton(id: number) {
        const confirmResult = await sweetalert.fire({ icon: "question", text: "確定要取消此任務？", showCancelButton: true, showConfirmButton: true });

        if (!confirmResult.isConfirmed) {
            return;
        }

        canceling = true;

        try {
            const cancelResult = await managementService.notification.cancelTask(id.toString());

            if (!cancelResult.success) {
                await sweetalert.fire({
                    icon: "error",
                    text: cancelResult?.error?.message ?? "取消任務錯誤",
                });
            }
            // reload
            await getList();
        } catch (error) {
        } finally {
            canceling = false;
        }

        return;
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
    <h1>推播列表</h1>

    <div>
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>推播任務代碼</th>
                    <th>推播任務名稱</th>
                    <th>狀態</th>
                    <th>目標數 | 開啟 | 點擊</th>
                    <th>建立時間</th>
                    <th>執行時間</th>
                    <th>動作</th>
                </tr>
            </thead>
            <tbody>
                {#each items as item}
                    <tr>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{getStatusText(item.status)}</td>
                        <td> {item.ta.count} | {item.status === EnumTaskStatus.Completed ? item.ta.readCount : "-"} | {item.status === EnumTaskStatus.Completed ? item.ta.clickedCount : "-"} </td>
                        <td>{formatUnknownDate(item.createDate)}</td>
                        <td>{formatUnknownDate(item.startTime)}</td>
                        <td>
                            <button
                                on:click={() => {
                                    clickDetailButton(item.id);
                                }}
                                class="btn btn-outline-dark"
                            >
                                檢視任務
                            </button>

                            <button
                            on:click={() => {
                                clickPreview(item.templateId);
                            }}
                            class="btn btn-primary"
                        >
                            快速預覽
                        </button>

                            {#if item.status === EnumTaskStatus.Pending}
                                <button
                                    disabled={canceling}
                                    on:click={() => {
                                        clickCancelButton(item.id);
                                    }}
                                    class="btn btn-danger"
                                >
                                    取消執行
                                </button>
                            {/if}
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

<Modal dialogClasses="modal-lg" bind:open={isModalOpen}>
    <div class="modal-header">
        <h5 class="modal-title">詳細資料</h5>
        <button type="button" class="btn-close" on:click={() => (isModalOpen = false)} />
    </div>
    <div class="modal-body">
        <table class="table table-bordered">
            <tbody>
                {#if modalTask !== null}
                    <tr> <td>推播任務代碼</td> <td> {modalTask.id} </td> </tr>
                    <tr> <td>推播任務名稱</td> <td>{modalTask.name}</td> </tr>
                    <tr> <td>狀態</td> <td>{getStatusText(modalTask.status)}</td> </tr>
                    <tr> <td>目標數 </td> <td>{modalTask.ta.count}</td> </tr>
                    <tr> <td> 開啟數 </td> <td>{modalTask.status === EnumTaskStatus.Completed ? modalTask.ta.readCount : "-"}</td> </tr>
                    <tr> <td> 點擊數</td> <td>{modalTask.status === EnumTaskStatus.Completed ? modalTask.ta.clickedCount : "-"}</td> </tr>
                    <tr> <td>建立時間</td> <td>{formatUnknownDate(modalTask.createDate)}</td> </tr>
                    <tr> <td>執行時間</td> <td>{formatUnknownDate(modalTask.startTime)}</td> </tr>
                {/if}
            </tbody>
        </table>
    </div>
    <div class="modal-footer">
        {#if modalTask !== null && modalTask.status === EnumTaskStatus.Pending}
            <button
                disabled={canceling}
                on:click={async () => {
                    await clickCancelButton(modalTask.id);
                    isModalOpen = false;
                }}
                type="button"
                class="btn btn-danger">取消任務</button
            >
        {/if}

        <button on:click={() => (isModalOpen = false)} type="button" class="btn btn-secondary">關閉視窗</button>
    </div>
</Modal>

{#if previewItems}
    <PreviewTemplate items={previewItems} bind:show={previewShow} />
{/if}
