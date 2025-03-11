<template>
  <header id="mainHeader" class="bg-gradient-to-r from-red-600 to-black p-4 text-white fixed top-0 left-0 right-0 z-40">
    <div class="container mx-auto flex flex-col md:flex-row justify-between items-center w-full">
      <h1 class="text-3xl font-bold">
        SAMIKADOS <router-link to="/view"><span class="text-lg">SELLER</span></router-link>
      </h1>

      <div v-if="showSearch" class="relative w-full md:w-1/2 lg:w-1/3 mt-4 md:mt-0">
        <slot name="search"></slot>
      </div>

      <div class="flex items-center space-x-4 mt-4 md:mt-0">
        <!-- Toggle button -->
        <button @click="toggleSidebar" id="toggleSidebar" class="lg:hidden p-2 rounded">
          <img src="/icon/bars-solid.svg" alt="Menu Icon" class="w-6 h-6">
        </button>

        <!-- Notification and User Icon -->
        <router-link to="/notifikasi">
          <img src="/icon/bell-regular.svg" alt="Notification Icon" class="w-6 h-6">
        </router-link>

        <router-link to="/profile">
          <img src="/icon/user-regular.svg" alt="User Icon" class="w-6 h-6">
        </router-link>

        <span class="font-semibold">RuangJayaPrint</span>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  props: {
    showSearch: {
      type: Boolean,
      default: false
    },
  },
  methods: {
    toggleSidebar() {
      this.$emit("toggle-sidebar"); 
    },
  },
};
</script>

<style scoped>
/* Header Seller Responsiveness */
@media (max-width: 1024px) {
  #mainHeader {
    padding-top: 20px;
    padding-bottom: 20px;
  }
}
</style>
