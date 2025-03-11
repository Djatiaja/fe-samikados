<template>
    <div class="category-item bg-red-600 text-white rounded-lg flex items-center">
      <a :href="link" class="flex items-center space-x-4 w-full p-4 md:p-6">
        <img :src="image" :alt="'Category Icon ' + name" class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12">
        <span class="text-xs sm:text-sm lg:text-base font-medium">{{ name }}</span>
      </a>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      name: String,
      image: String,
      link: String
    }
  };
  </script>
  
  <style scoped>
  .category-item {
    width: 100%;
    height: 44px;
    min-height: 2.5rem;
  }
  
  @media (min-width: 768px) {
    .category-item {
      min-height: 3.5rem;
    }
  }
  
  @media (min-width: 1024px) {
    .category-item {
      min-height: 5rem;
    }
  }
  </style>