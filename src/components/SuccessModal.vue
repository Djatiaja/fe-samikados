<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full md:w-1/3">
        <h3 class="text-2xl mb-4 font-semibold text-center">{{ title }}</h3>
        <img v-if="imageSrc" :src="'/image/success.gif'" alt="Success Icon" class="mx-auto mb-5 mt-6 w-2/12" />
        <p class="text-center">{{ message }}</p>
        <div class="flex justify-center mt-10">
          <button
            type="button"
            class="bg-red-600 text-white py-3 px-4 rounded-lg w-1/3"
            @click="$emit('confirm')"
          >
            {{ buttonText }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      isOpen: Boolean,  
      title: String,  // Judul modal
      message: String,  // Pesan modal
      buttonText: { type: String, default: "Tutup" },
    },
  };
  </script>
  