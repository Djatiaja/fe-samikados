<template>
    <div class="flex flex-col min-h-screen">
      <!-- Overlay for sidebar on mobile -->
      <div 
        id="overlay" 
        :class="{ 'block': isSidebarActive && isMobile, 'hidden': !isSidebarActive || !isMobile }" 
        @click="toggleSidebar"
        class="fixed inset-0 bg-opacity-20 z-20"
      ></div>
  
      <!-- Header -->
      <HeaderSeller @toggle-sidebar="toggleSidebar" :showSearch="true">
        <template #search>
            <div class="relative w-full">
            <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Cari pengiriman..." 
                class="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 bg-white text-black"
            >
            <div class="absolute left-4 top-3">
                <img src="/icon/magnifying-glass-solid.svg" alt="Search" class="h-4 w-4 text-gray-400">
            </div>
            </div>
        </template>
    </HeaderSeller>

  
      <!-- Sidebar -->
      <SidebarSeller :isSidebarActive="isSidebarActive" />
  
      <!-- Content Wrapper -->
      <div 
        class="content-wrapper bg-gray-100 flex-1 mt-32 sm:mt-32 md:mt-16" 
        :class="{ 'lg:ml-64': isSidebarActive }"
      >
        <div class="p-4 md:p-6 lg:p-8">
          <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6">Notifikasi</h2>
          <div>
            <NotifCard title="Admin" message="Halo Ruang Jaya Print! Selamat bergabung dengan SAMIKADOS. Silahkan chat Admin jika perlu bantuan." date_time="20 Oktober 2024, 10:00 AM"/>
            <NotifCard title="Admin" message="Halo Ruang Jaya Print! Selamat bergabung dengan SAMIKADOS. Silahkan chat Admin jika perlu bantuan." date_time="20 Oktober 2024, 10:00 AM"/>
          </div>
        </div>
      </div>
  
      <FooterSeller />
    </div>
  </template>
  
  <script>
  import HeaderSeller from "@/components/HeaderSeller.vue";
  import SidebarSeller from "@/components/SidebarSeller.vue";
  import FooterSeller from "@/components/FooterSeller.vue";
  import NotifCard from "@/components/NotifCard.vue";

  export default {
    components: { HeaderSeller, SidebarSeller, FooterSeller, NotifCard },
    data() {
      return {
        isSidebarActive: false,
        isMobile: window.innerWidth < 1024,
        statusFilter: 'all',
        entriesPerPage: 25,
      };
    },
    mounted() {
      this.isSidebarActive = window.innerWidth >= 1024;
      window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.handleResize);
    },
    methods:{
      toggleSidebar() {
        if (this.isMobile) {
          this.isSidebarActive = !this.isSidebarActive;
        }
      },
      handleResize() {
        this.isMobile = window.innerWidth < 1024;
        this.isSidebarActive = !this.isMobile;
      },
    }
  };
  </script>