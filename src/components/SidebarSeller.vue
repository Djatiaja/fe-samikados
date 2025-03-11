<template>
    <aside 
    id="sidebar" 
    :class="[
      'bg-white shadow-md fixed top-0 bottom-0 left-0 pt-16 p-6 z-30',
      { 'translate-x-0': isSidebarActive, '-translate-x-full': !isSidebarActive },
      'lg:translate-x-0 w-64 transition-all duration-300 ease-in-out'
    ]"
    >
      <nav>
        <ul class="space-y-2 mt-34 md:mt-20 lg:mt-10">
          <li v-for="(menu, index) in menus" :key="index" 
              :class="{ 'bg-red-600 text-white': menu.active, 'text-gray-700 hover:bg-gray-100': !menu.active }"
              class="p-2 rounded-md transition-colors duration-200">
            <router-link :to="menu.route" class="block">{{ menu.label }}</router-link>
          </li>
        </ul>
      </nav>
    </aside>
  </template>
  
  <script>
  export default {
    props: {
      isSidebarActive: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      menus() {
        return [
          { label: "Dashboard", route: "/dashboard-seller", active: this.$route.path === "/dashboard-seller" },
          { label: "Pesanan", route: "/pesanan-seller", active: this.$route.path === "/pesanan-seller" },
          { label: "Pengiriman", route: "/pengiriman-seller", active: this.$route.path === "/pengiriman-seller" },
          { label: "Manajemen Produk", route: "/manajemen-produk", active: this.$route.path === "/manajemen-produk" },
          { label: "Etalase", route: "/etalase-seller", active: this.$route.path === "/etalase-seller" },
          { label: "History", route: "/history-seller", active: this.$route.path === "/history-seller" },
          { label: "Laporan", route: "/laporan-seller", active: this.$route.path === "/laporan-seller" },
          { label: "Ajukan Penarikan", route: "/ajukan-penarikan", active: this.$route.path === "/ajukan-penarikan" },
        ];
      },
    }
  };
  </script>
  