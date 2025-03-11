<template>
    <div class="flex flex-col items-center">
      <a :href="link">
        <img :src="image" :alt="'Icon for ' + name" class="mb-2 w-8 h-8 sm:w-12 sm:h-12 lg:w-18 lg:h-18">
        <span class="text-xs sm:text-base lg:text-md">{{ name }}</span>
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
  