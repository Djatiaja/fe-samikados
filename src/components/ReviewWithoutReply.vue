<template>
    <div class="flex flex-col lg:flex-row items-start mb-8">
      <!-- User Info (Profile, Name, Date, Stars) -->
      <div class="flex flex-col lg:flex-row items-start mr-6 w-full lg:w-1/2">
        <img :src="review.profilePic" alt="User profile picture" class="rounded-full mr-4 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16">
        <div>
          <span class="font-bold block text-sm sm:text-base lg:text-lg">{{ review.user }}</span>
          <span class="text-gray-500 text-xs sm:text-sm lg:text-base">{{ review.time }} | {{ review.date }}</span>
          <div class="flex items-center mt-1">
            <i 
              v-for="star in 5" 
              :key="star"
              class="fas fa-star text-yellow-500 text-xs sm:text-sm lg:text-base"
              :class="{ 'text-gray-300': star > review.rating }"
            ></i>
          </div>
        </div>
      </div>
  
      <!-- Review Text -->
      <div class="flex-1">
        <p class="text-gray-700 text-sm sm:text-base lg:text-lg">
          {{ review.content }}
        </p>
        <!-- Tanggapi Button -->
        <button 
          @click="$emit('reply', review.id)" 
          class="mt-2 text-red-600 border border-red-600 px-4 py-1 rounded-lg text-xs sm:text-base lg:text-lg"
        >
          Tanggapi
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      review: {
        type: Object,
        required: true
      }
    },
    emits: ['reply']
  }
  </script>