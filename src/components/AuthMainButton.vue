<template>
    <button
      class="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg mb-4 transition duration-300 shadow-lg"
      @click="$emit('click')"
    >
      {{ text }}
    </button>
  </template>
  
  <script>
  export default {
    props: {
      text: String,
    },
  };
  </script>
  