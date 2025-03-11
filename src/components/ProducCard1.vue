<template>
    <div class="p-4 mx-auto border border-gray-200 shadow-md rounded-lg hover:shadow-lg transition">
      <a :href="link" class="block">
        <img :src="image" :alt="'Product image for ' + name" class="w-full mb-2 rounded-t-lg">
        <div class="p-2">
          <div class="text-sm lg:text-base font-semibold">{{ name }}</div>
          <div class="text-gray-500 text-sm lg:text-base">Rp{{ price }}</div>
        </div>
      </a>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      name: String,
      image: String,
      price: String,
      link: String
    }
  };
  </script>
  
  <style scoped>
  a {
    text-decoration: none;
    color: inherit;
  }
  </style>
  