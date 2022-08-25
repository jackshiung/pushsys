<script lang="ts">
  import { managementService } from "../services";
  import sweetalert from "sweetalert2";
  import { navigate } from "svelte-routing";
  import * as luxon from "luxon";
  import * as _ from "lodash";

  let audienceQuantity: number = 0;
  let showAudienceQuantity: boolean = false;
  let showLoadingSpinner: boolean = false;
  let gotTheQuantity: boolean = false;

  type Filter = {
    isImport: boolean;
    isFollowed: boolean;
    name: string;
    startDateText: string;
    endDateText: string;
    startDate: Date;
    endDate: Date;
  };

  let currentFilter: Filter = {
    isImport: false,
    name: "",
    startDateText: "",
    endDateText: "",
    endDate: null,
    startDate: null,
    isFollowed: true
  };

  const model: {
    name: string;
    filter: Filter;
  } = {
    name: "",
    filter: {
      isImport: false,
      name: "",
      startDateText: "",
      endDateText: "",
      endDate: null,
      startDate: null,
      isFollowed: true
    },
  };

  async function calculateAudienceQuantity() {
    showLoadingSpinner = true;

    model.filter.startDate = model.filter.startDateText
      ? luxon.DateTime.fromISO(model.filter.startDateText).toJSDate()
      : null;
    model.filter.endDate = model.filter.endDateText
      ? luxon.DateTime.fromISO(model.filter.endDateText).toJSDate()
      : null;

    const result = await managementService.target.getTargets({
      index: 1,
      size: 1,
      date1: model.filter.startDate,
      date2: model.filter.endDate,
      name: model.filter.name,
      isImport: model.filter.isImport,
      isFollowed: true
    });

    if (!result.success) {
      await sweetalert.fire({
        icon: "error",
        title: "預估受眾人數錯誤",
        text: result.message,
      });
      return;
    }
    gotTheQuantity = true;
    audienceQuantity = result.page.dataAmount;
    showLoadingSpinner = false;
    showAudienceQuantity = true;

    currentFilter = {
      ...model.filter,
    };
  }

  async function changeFilter() {
    showAudienceQuantity =
      _.isEqual(currentFilter, model.filter) && gotTheQuantity;
  }

  async function createAudience() {
    if (!model.name) {
      await sweetalert.fire({
        icon: "error",
        title: "建立受眾錯誤",
        text: `受眾名稱為必填`,
      });
      return;
    }

    const result = await managementService.target.createTargetGroup({
      name: model.name,
      filters: {
        name: model.filter.name,
        date1: model.filter.startDate,
        date2: model.filter.endDate,
        isImport: model.filter.isImport,
      },
    });

    if (!result.success) {
      await sweetalert.fire({
        icon: "error",
        title: "建立受眾錯誤",
        text: result?.error?.message,
      });
      return;
    }

    navigate("/management/audiences", { replace: true });
  }
</script>

<div>
  <h1 class="mb-5">建立受眾</h1>

  <div>
    <h5>基本設定</h5>

    <div class="mb-3">
      <label for="txt-audience-name" class="form-label">名稱</label>
      <input
        placeholder="請填入受眾名稱"
        maxlength="20"
        bind:value={model.name}
        type="text"
        class="form-control"
        id="txt-audience-name"
      />
    </div>

    <hr class="my-4" />
    <h5 class="mb-4">受眾篩選</h5>

    <div class="row g-3 border">
      <div class="col-12">
        <label for="txt-audience-name" class="form-label">名稱（關鍵字）</label>
        <input
          on:change={() => {
            changeFilter();
          }}
          bind:value={model.filter.name}
          id="txt-audience-name"
          type="text"
          class="form-control"
        />
      </div>

      <div class="col-6">
        <label for="txt-audience-start-time" class="form-label"
          >使用者加入起始時間</label
        >
        <input
          on:change={() => {
            changeFilter();
          }}
          bind:value={model.filter.startDateText}
          id="txt-audience-start-time"
          type="datetime-local"
          class="form-control"
        />
      </div>
      <div class="col-6">
        <label for="txt-audience-end-time" class="form-label"
          >使用者加入結束時間</label
        >
        <input
          on:change={() => {
            changeFilter();
          }}
          bind:value={model.filter.endDateText}
          id="txt-audience-end-time"
          type="datetime-local"
          class="form-control"
        />
      </div>

      <div class="col-12">
        <div class="form-check">
          <input
            on:change={() => {
              changeFilter();
            }}
            class="form-check-input"
            type="checkbox"
            bind:checked={model.filter.isImport}
            id="input-import-user"
          />
          <label class="form-check-label" for="input-import-user">
            手動匯入的使用者
          </label>
        </div>
      </div>

      <div class="col-12 mb-3">
        <button
          disabled={showLoadingSpinner}
          on:click={() => {
            calculateAudienceQuantity();
          }}
          class="btn btn-danger"
        >
          <div
            class={`spinner-border spinner-border-sm ${
              showLoadingSpinner ? "" : "d-none"
            }`}
            role="status"
          >
            <span class="visually-hidden">Loading...</span>
          </div>

          預估受眾人數
        </button>
      </div>

      <div class={`col-12 mb-3 ${showAudienceQuantity ? "" : "d-none"}`}>
        <div class="bg-danger bg-gradient bg-opacity-75">
          <div class="p-3 text-light">
            預估人數： <span class="fw-bold fs-4">{audienceQuantity}</span> 人
          </div>
        </div>
      </div>
    </div>

    <div class="my-4">
      <button
        disabled={!showAudienceQuantity}
        on:click={() => {
          createAudience();
        }}
        class="btn btn-primary"
      >
        建立受眾
      </button>
    </div>
  </div>
</div>
