<script lang="ts">
  import Pagination from "../components/Pagination.svelte";
  import { navigate } from "svelte-routing";
  import { onMount } from "svelte";
  import { managementService } from "../services";
  import { formatUnknownDate, tryGetInteger, tryGetString } from "../utils";
  import sweetalert from "sweetalert2";
  import type { LineUser } from "../services/target.svc";

  let urlParams = new URLSearchParams(window.location.search);
  let index: number = tryGetInteger(urlParams.get("p"), 1);
  let size: number = tryGetInteger(urlParams.get("ps"), 10);
  let name: string = tryGetString(urlParams.get("name"), "");
  let isFollowed: number = tryGetInteger(urlParams.get("is_followed"), -1);

  let totalCount: number = 0;
  let items: LineUser[] = [];
  let isSearching = false;

  type Filter = {
    isImport: boolean;
    isFollowed: boolean;
    name: string;
    startDateText: string;
    endDateText: string;
    startDate: Date;
    endDate: Date;
  };

  let filter: Filter = {
    isImport: false,
    name: "",
    startDateText: "",
    endDateText: "",
    endDate: null,
    startDate: null,
    isFollowed: null,
  };

  async function getList() {
    // set url
    urlParams.set("p", index.toString());
    urlParams.set("ps", size.toString());
    urlParams.set("name", filter.name);
    urlParams.set("is_followed", isFollowed.toString());

    location.href = location.pathname + "?" + urlParams.toString();
  }

  onMount(async () => {
    // set filters
    filter.name = name;

    if (isFollowed.toString() == "1") {
      filter.isFollowed = true;
    } else if (isFollowed.toString() == "0") {
      filter.isFollowed = false;
    } else {
      filter.isFollowed = null;
    }

    isSearching = true;
    const result = await managementService.target.getTargets({
      index,
      size,
      date1: filter.startDate,
      date2: filter.endDate,
      name: filter.name,
      isImport: filter.isImport,
      isFollowed: filter.isFollowed,
    });
    items = result.items;
    totalCount = result.page.dataAmount;
    isSearching = false;
  });
</script>

<div class="pb-5 pt-2">
  <h1>訂閱戶管理</h1>

  <div class="my-4 border py-4 px-2">
    <div class="row">
      <label class="col-auto col-form-label" for="txt_filter_display_name"
        >Line 顯示名稱</label
      >
      <div class="col-auto">
        <input
          bind:value={filter.name}
          type="email"
          class="form-control"
          id="txt_filter_display_name"
          placeholder="Line 顯示名稱"
        />
      </div>

      <label class="col-auto col-form-label" for="select_following_status"
        >訂閱狀態</label
      >
      <div class="col-auto">
        <select
          bind:value={isFollowed}
          id="select_following_status"
          class="form-select"
          aria-label="Following Status"
        >
          <option value={-1}>- 不拘 -</option>
          <option value={1}>訂閱中</option>
          <option value={0}>封鎖中</option>
        </select>
      </div>

      <div class="col-auto">
        <button
          disabled={isSearching}
          on:click={() => {
            index = 1;
            getList();
          }}
          class="btn btn-primary"
        >
          {isSearching ? "搜尋中..." : "搜尋"}
        </button>
      </div>
    </div>

    <div />
  </div>

  <div>
    <table class="table table-bordered table-striped table-hover">
      <thead>
        <tr>
          <th style="width: 75px;">大頭貼</th>
          <th>Line 顯示名稱</th>
          <th>訂閱狀態</th>
          <th>加入時間</th>
        </tr>
      </thead>
      <tbody>
        {#each items as item}
          <tr>
            <td>
              {#if item.pictureUrl}
                <img
                  src={item.pictureUrl}
                  style="width: 50px; height: 50px;"
                  class="rounded-circle"
                  alt="avatar"
                />
              {:else}
                <div
                  style="width: 50px; height: 50px; line-height: 50px;"
                  class="rounded-circle text-center border bg-light bg-gradient"
                >
                  <i class="bi bi-person" style="font-size: 2rem;" />
                </div>
              {/if}
            </td>
            <td>
              {item.displayName}
              <span
                data-id={item.id}
                data-line-user-id={item.lineUserId}
                class="d-none">{item.lineUserId}</span
              >
            </td>
            <td>
              {#if item.isFollowed === null || item.isFollowed === undefined}
                未知
              {:else if item.isFollowed}
                訂閱中
              {:else}
                <span class="text-danger">封鎖中</span>
              {/if}
            </td>
            <td>
              {formatUnknownDate(item.createDate)}
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
