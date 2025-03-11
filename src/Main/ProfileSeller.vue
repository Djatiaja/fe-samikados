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
      <HeaderSeller @toggle-sidebar="toggleSidebar"/>

  
      <!-- Sidebar -->
      <SidebarSeller :isSidebarActive="isSidebarActive" />
  
      <!-- Content Wrapper -->
      <div 
        class="content-wrapper bg-gray-100 flex-1 mt-32 sm:mt-32 md:mt-16" 
        :class="{ 'lg:ml-64': isSidebarActive }"
      >
        <div class="p-4 md:p-6 lg:p-8">
            <!-- Profile Section -->
        <div class="flex flex-col md:flex-row items-start md:space-x-20 justify-center">
            <!-- Profile Picture and Actions -->
            <div class="w-full md:w-1/4 flex flex-col items-center">
                <img src="https://placehold.co/300x300" class="rounded-lg shadow-lg w-full max-w-xs min-w-60" alt="Profile Picture" />
                
                <!-- Button Ganti Foto Profil -->
                <button class="mt-5 w-full max-w-xs bg-red-600 text-white py-3 rounded-lg text-sm sm:text-base md:text-lg min-w-60" onclick="openPhotoModal()">Ganti Foto Profil</button>

                <!-- Nonaktifkan Akun Toggle Switch -->
                <div class="flex items-center justify-center mt-3 md:mt-5 w-full">
                    <label class="inline-flex justify-evenly items-center w-full max-w-xs bg-red-600 text-white py-3 rounded-lg text-sm sm:text-base min-w-60 px-4">
                        <span id="toggleLabel" class="text-xs sm:text-sm md:text-base lg:text-lg">Nonaktifkan Akun</span>
                        <input type="checkbox" id="toggleAccountStatus" value="" class="sr-only peer" checked onchange="toggleAccountStatus()">
                        <div class="relative w-10 h-5 bg-white rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-red-600 after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                </div>
            </div>

            <!-- Profile Details -->
            <div class="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-lg h-auto flex flex-col items-center justify-center mt-10 md:mt-0">
                <h2 class="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 text-center">Profil Saya</h2>
                <div class="space-y-4 w-5/6 mt-8">
                    <div class="bg-gray-100 p-4 sm:p-5 lg:p-6 rounded-lg text-xs sm:text-sm md:text-base">RuangJayaPrint</div>
                    <div class="bg-gray-100 p-4 sm:p-5 lg:p-6 rounded-lg text-xs sm:text-sm md:text-base">081212341234</div>
                    <div class="bg-gray-100 p-4 sm:p-5 lg:p-6 rounded-lg text-xs sm:text-sm md:text-base">ruangjayaprint@gmail.com</div>
                </div>
                <button class="mt-10 w-full max-w-md bg-red-600 text-white py-3 rounded-lg mb-4 text-sm sm:text-base md:text-lg" onclick="openEditModal()">Edit Profil</button>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-20 md:mt-32 space-y-4 flex flex-col items-center justify-center">
            <button class="w-full max-w-md  lg:w-1/3 bg-red-600 text-white py-3 rounded-xl text-sm sm:text-base" onclick="openChangePasswordModal()">Ganti Password</button>
            <button class="w-full max-w-md  lg:w-1/3 bg-red-600 text-white py-3 rounded-xl text-sm sm:text-base">Log Out</button>
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