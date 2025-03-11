<template>
    <div class="notif-card items-center p-4 sm:p-5 lg:p-6 bg-white rounded-lg shadow-md space-x-4 w-full my-6">
        <div>
            <!-- Title -->
            <h3 class="font-bold text-lg sm:text-xl lg:text-2xl truncate">{{ title }}</h3>
            <!-- Message -->
            <p class="text-sm sm:text-base lg:text-lg text-gray-600 mt-2">{{ message }}</p>
            <!-- Date Time -->
            <p class="text-xs sm:text-sm lg:text-base text-gray-500 mt-2 block">{{ date_time }}</p>
        </div>
    </div>
  </template>

  <script>
  export default {
    name: "ReportCard",
    props: {
      title: String,
      message: String,
      date_time: String,
    }
  };
  </script>
  
  <style scoped>
  .notif-card {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 100%;
  }
  </style>
  