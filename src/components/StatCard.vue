<template>
  <div class="stat-card flex items-center p-4 sm:p-5 lg:p-6 bg-white rounded-lg shadow-md space-x-4 w-full overflow-hidden">
    <!-- Gambar -->
    <img :src="imgSrc" :alt="title" class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 object-contain flex-shrink-0 max-w-full">
    
    <div class="flex flex-col flex-grow">
      <!-- Title -->
      <h3 class="text-sm sm:text-base lg:text-lg xl:text-xl font-bold truncate">{{ title }}</h3>
      <!-- Value -->
      <p class="text-red-600 text-lg sm:text-xl lg:text-2xl xl:text-3xl truncate">{{ value }}</p>
      <!-- Subtitle -->
      <p class="text-gray-500 text-xs sm:text-sm lg:text-base xl:text-lg truncate">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "StatCard",
  props: {
    imgSrc: String,
    title: String,
    value: String,
    subtitle: String
  }
};
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100%;
}
</style>
