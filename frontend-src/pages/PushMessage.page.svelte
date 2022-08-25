<script lang="ts">
    import sweetalert2 from "sweetalert2";
    import { onMount } from "svelte";
    import Select2 from "svelte-select";
    import { managementService } from "../services";
    import type { ISearchTargetAudienceGroupResult } from "../services/target.svc";
    import type { Template } from "../services/template.svc";
    import { getErrorMessagesByValidateErrors, tryGetString } from "../utils";
    import * as luxon from "luxon";
    import { validate } from "class-validator";
    import { CreateTaskParameter } from "../services/notification.svc";
    import { navigate } from "svelte-routing";

    let urlParams = new URLSearchParams(window.location.search);
    let targetId = tryGetString(urlParams.get("target_id"), "");
    let defaultGroups: ISearchTargetAudienceGroupResult[] = [];
    let defaultTemplates: Template[] = [];
    let isDefaultDataReady: boolean = false;
    let selectedTargetGroup: ISearchTargetAudienceGroupResult = null;
    let selectedTemplate: Template = null;
    let pushScheduleType: "immediately" | "schedule" = "schedule";
    let disableScheduleInput: boolean = true;
    let minDate = luxon.DateTime.local().toFormat("yyyy-MM-dd");
    let isCreating: boolean = false;
    let name: string = "";
    let txtSelectDate: string = "";
    let txtSelectTime: string = "";

    const querySize = 100;

    async function loadTargets(name: string): Promise<ISearchTargetAudienceGroupResult[]> {
        const result = await managementService.target.getTargetGroupList({
            index: 1,
            size: querySize,
            name,
        });

        return result.items;
    }

    async function loadTemplates(name: string): Promise<Template[]> {
        const result = await managementService.template.getTemplates({
            index: 1,
            size: querySize,
            name: name ? name.trim() : undefined,
        });
        return result.items;
    }

    function getLabel(item: Template | ISearchTargetAudienceGroupResult): string {
        return `${item.name}`;
    }

    onMount(async () => {
        const groupList = await managementService.target.getTargetGroupList({
            index: 1,
            size: querySize,
        });

        defaultGroups = [...groupList.items];

        const templateList = await managementService.template.getTemplates({
            index: 1,
            size: querySize,
        });

        defaultTemplates = [...templateList.items];

        isDefaultDataReady = true;

        if (targetId) {
            const response = await managementService.target.getTargetGroup(targetId);
            if (response.success) {
                selectedTargetGroup = response.item;
            }
        }
    });

    async function clickConfirm() {
        try {
            isCreating = true;
            await createTask();
            navigate("/management/messages-list");
        } catch (error) {
            await sweetalert2.fire({
                icon: "error",
                html: error.message ?? "未知的錯誤",
            });
        } finally {
            isCreating = false;
        }
    }

    async function createTask() {
        const param = new CreateTaskParameter();
        param.name = name;
        param.lineTemplateId = selectedTemplate?.id ?? null;
        param.taGroupId = selectedTargetGroup?.id ?? null;

        if (pushScheduleType === "immediately") {
            param.startTime = luxon.DateTime.local().toISO();
        } else if (pushScheduleType === "schedule") {
            param.startTime = luxon.DateTime.fromFormat(`${txtSelectDate} ${txtSelectTime}`, "yyyy-MM-dd HH:mm").toISO();
        }

        const errors = await validate(param);

        if (errors && errors.length > 0) {
            throw new Error(getErrorMessagesByValidateErrors(errors).join("<br />"));
        }

        const result = await managementService.notification.createTask(param);

        if (!result.success) {
            throw new Error(`新增任務錯誤:${result?.error?.message ?? "未知的錯誤"}`);
        }

        const confirmResult = await managementService.notification.confirmTask(result.item.id.toString());

        if (!confirmResult.success) {
            throw new Error(`確認任務錯誤:${confirmResult?.error?.message ?? "未知的錯誤"}`);
        }

        return;
    }

    $: {
        disableScheduleInput = pushScheduleType !== "schedule";
    }
</script>

<div>
    <h1>發送推播</h1>

    <div>
        <div class="mb-3">
            <label for="txt-task-name" class="form-label">推送任務名稱</label>
            <input bind:value={name} type="text" class="form-control" id="txt-task-name" />
        </div>

        <div class="mb-3">
            <label for="txt-task-name" class="form-label">受眾</label>

            {#if isDefaultDataReady}
                <Select2
                    bind:selectedValue={selectedTargetGroup}
                    items={defaultGroups}
                    noOptionsMessage="沒有受眾"
                    placeholder="輸入關鍵字並選擇受眾"
                    optionIdentifier={"id"}
                    loadOptions={loadTargets}
                    getSelectionLabel={getLabel}
                    getOptionLabel={getLabel}
                />
            {/if}
        </div>

        <div class="mb-3">
            <label for="txt-task-name" class="form-label">模板</label>

            {#if isDefaultDataReady}
                <Select2
                    bind:selectedValue={selectedTemplate}
                    items={defaultTemplates}
                    noOptionsMessage="查無模板"
                    placeholder="輸入關鍵字並選擇模板"
                    optionIdentifier={"id"}
                    loadOptions={loadTemplates}
                    getSelectionLabel={getLabel}
                    getOptionLabel={getLabel}
                />
            {/if}
        </div>

        <div class="mb-3">
            <label for="txt-task-name" class="form-label">推送時間</label>

            <div class="row g-3">
                <div class="col-auto" style="align-self: center;">
                    <div class="form-check form-check-inline">
                        <input bind:group={pushScheduleType} class="form-check-input" type="radio" name="inlineRadioOptions" id="radio-immediately-push" value="immediately" />
                        <label class="form-check-label" for="radio-immediately-push">立即發送</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input bind:group={pushScheduleType} class="form-check-input" type="radio" name="inlineRadioOptions" id="radio-schedule" value="schedule" />
                        <label class="form-check-label" for="radio-schedule">預約排程</label>
                    </div>
                </div>
                <div class="col-auto">
                    <input bind:value={txtSelectDate} disabled={disableScheduleInput} class="form-control" type="date" min={minDate} />
                </div>
                <div class="col-auto">
                    <input bind:value={txtSelectTime} disabled={disableScheduleInput} class="form-control" type="time" />
                </div>
            </div>
        </div>

        <div class="mb-3">
            <button
                disabled={isCreating}
                on:click={() => {
                    clickConfirm();
                }}
                class="btn btn-outline-dark"
            >
                確認執行
            </button>
        </div>
    </div>
</div>
