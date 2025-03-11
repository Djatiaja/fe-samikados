<template>
    <header class="bg-gradient-to-r from-red-600 to-black p-4 shadow-lg">
      <div class="container mx-auto flex justify-between items-center">
        <div class="flex items-center text-white">
          <h1 class="text-3xl lg:text-4xl font-bold">{{ title }}</h1>
          <span class="text-lg lg:text-xl ml-4">{{ subtitle }}</span>
        </div>
      </div>
    </header>
  </template>
  
  <script>
  export default {
    props: {
      title: String,
      subtitle: String,
    },
  };
  </script>
  