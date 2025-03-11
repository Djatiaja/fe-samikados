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
                placeholder="Cari produk..." 
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
          <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6">Etalase</h2>
  
          <div class="mb-8">
            <!-- Merchandise Section -->
            <div class="flex mb-4">
                <h2 class="text-xl font-semibold">Merchandise</h2>
            </div>
            <!-- Wrapper for horizontal scroll -->
            <div class="overflow-x-auto">
                <div class="grid grid-flow-col auto-cols-max gap-x-4 max-w-screen-lg">
                    <!-- Product Card -->
                    <article class="bg-red-600 text-white p-3 rounded-lg inline-block">
                        <img src="https://placehold.co/250x250?text=Merchandise+1" alt="Produk 1" class="w-full mb-4">
                        <h4 class="font-bold">Produk Merchandise 1</h4>
                        <p>Rp85.000</p>
                        <p class="text-sm">1.000+ Terjual</p>
                    </article>
                    <article class="bg-red-600 text-white p-3 rounded-lg inline-block">
                        <img src="https://placehold.co/250x250?text=Merchandise+2" alt="Produk 2" class="w-full mb-4">
                        <h4 class="font-bold">Produk Merchandise 2</h4>
                        <p>Rp90.000</p>
                        <p class="text-sm">2.000+ Terjual</p>
                    </article>
                    <article class="bg-red-600 text-white p-3 rounded-lg inline-block">
                        <img src="https://placehold.co/250x250?text=Merchandise+3" alt="Produk 3" class="w-full mb-4">
                        <h4 class="font-bold">Produk Merchandise 3</h4>
                        <p>Rp95.000</p>
                        <p class="text-sm">3.000+ Terjual</p>
                    </article>
                    <article class="bg-red-600 text-white p-3 rounded-lg inline-block">
                        <img src="https://placehold.co/250x250?text=Merchandise+4" alt="Produk 4" class="w-full mb-4">
                        <h4 class="font-bold">Produk Merchandise 4</h4>
                        <p>Rp100.000</p>
                        <p class="text-sm">4.000+ Terjual</p>
                    </article>
                    <article class="bg-red-600 text-white p-3 rounded-lg inline-block">
                        <img src="https://placehold.co/250x250?text=Merchandise+5" alt="Produk 5" class="w-full mb-4">
                        <h4 class="font-bold">Produk Merchandise 5</h4>
                        <p>Rp105.000</p>
                        <p class="text-sm">5.000+ Terjual</p>
                    </article>
                    <article class="bg-red-600 text-white p-3 rounded-lg inline-block">
                        <img src="https://placehold.co/250x250?text=Merchandise+6" alt="Produk 6" class="w-full mb-4">
                        <h4 class="font-bold">Produk Merchandise 6</h4>
                        <p>Rp110.000</p>
                        <p class="text-sm">6.000+ Terjual</p>
                    </article>
                </div>
            </div>
          </div>
        <!-- Accessories Section -->
         <div class="mb-8">
            <div class="flex mb-4">
                <h2 class="text-xl font-semibold">Accessories</h2>
            </div>
            <!-- Wrapper for horizontal scroll -->
            <div class="overflow-x-auto">
                <div class="grid grid-flow-col auto-cols-max gap-x-4 max-w-screen-lg">
                    <!-- Product Card -->
                    <article class="bg-red-600 text-white p-3 rounded-lg inline-block">
                        <img src="https://placehold.co/250x250?text=Accessories+1" alt="Produk 1" class="w-full mb-4">
                        <h4 class="font-bold">Produk Accessories 1</h4>
                        <p>Rp55.000</p>
                        <p class="text-sm">500+ Terjual</p>
                    </article>
                    <article class="bg-red-600 text-white p-3 rounded-lg inline-block">
                        <img src="https://placehold.co/250x250?text=Accessories+2" alt="Produk 2" class="w-full mb-4">
                        <h4 class="font-bold">Produk Accessories 2</h4>
                        <p>Rp58.000</p>
                        <p class="text-sm">600+ Terjual</p>
                    </article>
                    <article class="bg-red-600 text-white p-3 rounded-lg inline-block">
                        <img src="https://placehold.co/250x250?text=Accessories+3" alt="Produk 3" class="w-full mb-4">
                        <h4 class="font-bold">Produk Accessories 3</h4>
                        <p>Rp61.000</p>
                        <p class="text-sm">700+ Terjual</p>
                    </article>
                    <article class="bg-red-600 text-white p-3 rounded-lg inline-block">
                        <img src="https://placehold.co/250x250?text=Accessories+4" alt="Produk 4" class="w-full mb-4">
                        <h4 class="font-bold">Produk Accessories 4</h4>
                        <p>Rp64.000</p>
                        <p class="text-sm">800+ Terjual</p>
                    </article>
                    <article class="bg-red-600 text-white p-3 rounded-lg inline-block">
                        <img src="https://placehold.co/250x250?text=Accessories+5" alt="Produk 5" class="w-full mb-4">
                        <h4 class="font-bold">Produk Accessories 5</h4>
                        <p>Rp67.000</p>
                        <p class="text-sm">900+ Terjual</p>
                    </article>
                    <article class="bg-red-600 text-white p-3 rounded-lg inline-block">
                        <img src="https://placehold.co/250x250?text=Accessories+6" alt="Produk 6" class="w-full mb-4">
                        <h4 class="font-bold">Produk Accessories 6</h4>
                        <p>Rp70.000</p>
                        <p class="text-sm">1.000+ Terjual</p>
                    </article>
                </div>
            </div>
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
  
  export default {
    components: { HeaderSeller, SidebarSeller, FooterSeller },
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