<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full md:w-1/4">
        <h3 class="text-2xl mb-4 font-semibold text-center">{{ title }}</h3>
        <p class="text-center">{{ message }}</p>
        <div class="flex justify-between mt-6">
          <button
            type="button"
            class="bg-red-600 w-1/2 text-white py-2 px-4 mx-2 rounded-lg"
            @click="$emit('confirm')"
          >
            {{ confirmText }}
          </button>
          <button
            type="button"
            class="bg-gray-300 w-1/2 py-2 px-4 mx-2 rounded-lg"
            @click="$emit('close')"
          >
            {{ cancelText }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      isOpen: Boolean,  
      title: String, 
      message: String,
      confirmText: { type: String, default: "Ya" },  
      cancelText: { type: String, default: "Batal" },
    },
  };
  </script>
  