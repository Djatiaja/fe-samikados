<template>
    <header class="bg-gradient-to-r from-red-600 to-black text-white p-4 sticky top-0 z-20">
      <div class="container mx-auto flex justify-between items-center">
        
        <!-- Teks SAMIKADOS di kiri -->
        <h1 class="text-md sm:text-lg lg:text-2xl font-bold">
          SAMIKADOS
        </h1>
  
        <!-- Search Bar di tengah -->
        <div v-if="showSearch" class="relative w-1/2 md:w-1/2 lg:w-1/2 mx-auto">
          <input 
            type="text"
            :placeholder="searchPlaceholder" 
            class="w-full pl-10 pr-4 py-2 text-xs sm:text-sm lg:text-lg rounded-full focus:outline-none focus:ring-2 focus:ring-white bg-white text-black"
          />
          <img 
            src="/icon/magnifying-glass-solid.svg" 
            alt="Search Icon" 
            class="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4"
          />
        </div>
  
        <!-- Teks SELLER di kanan -->
        <a href="/dashboard-seller" class="text-xs sm:text-sm lg:text-lg">
          SELLER
        </a>
      </div>
    </header>
  </template>
  
  <script>
  export default {
    props: {
      showSearch: {
        type: Boolean,
        default: true
      },
      searchPlaceholder: {
        type: String,
        default: 'Search...'
      },
      searchQuery: {
        type: String,
        default: ''
      }
    }
  };
  </script>