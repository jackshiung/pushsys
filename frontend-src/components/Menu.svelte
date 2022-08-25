<script lang="ts">
  import { Link, link } from "svelte-routing";
  interface MenuItem {
    href: string;
    iconClassName: string;
    matchPaths: RegExp[];
    text: string;
    isDefault?: boolean;
  }

  const menuItems: MenuItem[] = [
    {
      href: "/management/subscribers",
      iconClassName: `bi-people`,
      matchPaths: [/\/management\/subscribers/],
      text: '訂閱戶管理'
    },
    {
      href: "/management/audiences",
      iconClassName: "bi-person-lines-fill",
      isDefault: true,
      matchPaths: [/\/management\/audiences/, /\/management\/create-audiences/, /\/management\/upload-audience/ , /^\/management\/?$/],
      text: "受眾清單",
    },
    {
      href: "/management/push-message",
      iconClassName: "bi-cursor-fill",
      matchPaths: [/\/management\/push-message$/],
      text: "發送推播",
    },
    {
      href: "/management/templates",
      iconClassName: "bi-vector-pen",
      matchPaths: [/\/management\/templates/, /\/management\/create-template/, /\/management\/edit-template/],
      text: "訊息模板",
    },
    {
      href: "/management/messages-list",
      iconClassName: "bi-card-list",
      matchPaths: [/\/management\/messages-list$/],
      text: "推播列表",
    }   
  ];

  interface PageMenuitem extends MenuItem {
    isActive: boolean;
  }

  $: currentHref = window.location.href;
  $: pageMenuItems = menuItems.map((item) => {
    const isActive = item.matchPaths.some((path) => path.test(currentHref));

    const pageMenuItem: PageMenuitem = {
      ...item,
      isActive,
    };

    return pageMenuItem;
  });

  function getProps(param, item: PageMenuitem) {
    const { location, href, isPartiallyCurrent, isCurrent } = param;

    let isActive = isPartiallyCurrent || isCurrent;

    if (isActive) {
      return { class: "active" };
    }

    isActive = item.matchPaths.some((path) => path.test(location.pathname));

    if (isActive) {
      return { class: "active" };
    }

    return {};
  }
</script>

<ul class="ul-menu">
  {#each pageMenuItems as item}
    <li>
      <Link
        to={item.href}
        getProps={(params) => {
          return getProps(params, item);
        }}
      >
        <i class="bi {item.iconClassName} " />
        {item.text}
      </Link>
    </li>
  {/each}
  <li>
    <a href="/logout"> <i class="bi bi-box-arrow-right" /> 登出 </a>
  </li>
</ul>

<style>
  .ul-menu {
    margin-left: 10px;
  }
  .ul-menu li {
    list-style: none;
    padding: 10px 5px;
    font-size: 1rem;
    text-align: left;
  }
  :global(.ul-menu li a) {
    text-decoration: none;
    color: #000000;
    display: block;
    width: 150px;
  }
  :global(.ul-menu li a.active) {
    color: #0d6efd;
  }

  .ul-menu li i {
    margin-right: 10px;
  }
</style>
