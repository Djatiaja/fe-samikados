<template>
    <a :href="link" class="bg-red-600 text-white p-2 sm:p-3 rounded-lg block">
      <img :src="image" :alt="name" class="w-full mb-2 sm:mb-4 lg:mb-6 rounded-md bg-white">
      <h4 class="font-bold text-sm sm:text-base lg:text-lg">{{ name }}</h4>
      <p class="text-xs sm:text-sm lg:text-base">{{ price }}</p>
      <p class="text-xs sm:text-sm lg:text-base">{{ sold }}</p>
    </a>
  </template>
  
  <script>
  export default {
    props: {
      link: {
        type: String,
        required: true
      },
      image: {
        type: String,
        default: "https://placehold.co/200x200"
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: String,
        required: true
      },
      sold: {
        type: String,
        required: true
      }
    }
  };
  </script>
  