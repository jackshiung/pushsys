<script lang="ts">
  /**
   * 資料總數
   */
  export let dataCount: number;
  /**
   * 一頁幾筆
   */
  export let pageSize: number;

  /**
   * 目前頁數
   */
  export let currentPageIndex: number = 1;
  export let onClickHandler: (pageIndex: number) => void;

  const pageRange = 5;

  interface Pagination {
    text: string;
    disable: boolean;
    pageIndex: number;
    isCurrent: boolean;
  }

  function goToPage(pageIndex: number) {
    onClickHandler(pageIndex);
  }

  function getPagination({
    text,
    index,
    lastIndex,
    forceDisableClass,
  }: {
    text: string;
    index: number;
    lastIndex: number;
    forceDisableClass: boolean;
  }): Pagination {
    return {
      text,
      isCurrent: currentPageIndex === index && !forceDisableClass,
      pageIndex: index,
      disable: index > lastIndex || index < 1,
    };
  }

  function getPageItems(
    currentPageIndex: number,
    dataCount: number
  ): Pagination[] {
    let startIndex = currentPageIndex;
    const halfRange = Math.round(pageRange / 2);

    // find start index
    for (let i = 0; i < halfRange; i++) {
      if (startIndex === 1) {
        break;
      }
      startIndex--;
    }

    const totalIndexs: number[] = [];

    for (let i = 0; i < pageRange; i++) {
      const index = i + 1;
      totalIndexs.push(index);

      if (index >= totalIndex) {
        break;
      }
    }

    const ret: Pagination[] = [];
    const lastIndex = totalIndex;
    ret.push(
      getPagination({
        index: 1,
        lastIndex,
        text: "第一頁",
        forceDisableClass: true,
      }),
      getPagination({
        index: currentPageIndex - 1,
        lastIndex,
        text: "上一頁",
        forceDisableClass: true,
      })
    );

    ret.push(
      ...totalIndexs.map((index) =>
        getPagination({
          index,
          lastIndex,
          text: index.toString(),
          forceDisableClass: false,
        })
      )
    );

    ret.push(
      getPagination({
        index: currentPageIndex + 1,
        lastIndex,
        text: "下一頁",
        forceDisableClass: true,
      }),
      getPagination({
        index: lastIndex,
        lastIndex,
        text: "最末頁",
        forceDisableClass: true,
      })
    );

    return ret;
  }
  
  $: totalIndex = Math.ceil(dataCount / pageSize);
  $: pages = getPageItems(currentPageIndex, dataCount);
</script>
<nav>
  <ul class="pagination justify-content-end">
    {#each pages as { disable, text, pageIndex, isCurrent }}
      <li
        class="page-item {disable ? 'disabled' : ''} {isCurrent ? 'active' : ''}">
        <a
          on:click|preventDefault={() => {
            goToPage(pageIndex);
            return;
          }}
          class="page-link"
          href=".">{text}</a>
      </li>
    {/each}
  </ul>
</nav>
