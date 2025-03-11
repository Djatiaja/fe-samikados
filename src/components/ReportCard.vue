<template>
    <div class="report-card flex items-center p-4 sm:p-5 lg:p-6 bg-white rounded-lg shadow-md space-x-4 w-full overflow-hidden border border-red-500">
      <div class="flex flex-col flex-grow">
        <!-- Title -->
        <h3 class="text-sm sm:text-base lg:text-lg xl:text-xl font-bold truncate">{{ title }}</h3>
        <!-- Value -->
        <p class="text-sm sm:text-base lg:text-lg xl:text-xl font-bold truncate">{{ value }}</p>
      </div>
      <!-- Gambar -->
      <img :src="imgSrc" :alt="title" class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 object-contain flex-shrink-0 max-w-full">
    </div>
  </template>
  
  <script>
  export default {
    name: "ReportCard",
    props: {
      imgSrc: String,
      title: String,
      value: String,
    }
  };
  </script>
  
  <style scoped>
  .report-card {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 100%;
    border-radius: 10px;
    background-color: #fff;
    border: 1px solid #FF4C4C;
  }
  </style>
  