<template>
  <header
    id="mainHeader"
    class="bg-gradient-to-r from-red-600 to-black p-4 text-white fixed top-0 left-0 right-0 z-40"
  >
    <div class="container mx-auto flex flex-col md:flex-row justify-between items-center w-full">
      <h1 class="text-3xl font-bold">
        SAMIKADOS <router-link to="/view"><span class="text-lg">SELLER</span></router-link>
      </h1>

      <div v-if="showSearch" class="relative w-full md:w-1/2 lg:w-1/3 mt-4 md:mt-0">
        <slot name="search"></slot>
      </div>

      <div class="flex items-center space-x-4 mt-4 md:mt-0">
        <!-- Toggle button -->
        <button @click="toggleSidebar" id="toggleSidebar" class="lg:hidden p-2 rounded">
          <img src="/icon/bars-solid.svg" alt="Menu Icon" class="w-6 h-6" />
        </button>

        <!-- Notification Icon with Badge -->
        <div class="relative">
          <router-link to="/notifikasi" class="relative">
            <img src="/icon/bell-regular.svg" alt="Notification Icon" class="w-6 h-6" />
            <span
              v-if="unreadNotifications > 0"
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
            </span>
          </router-link>
        </div>

        <router-link to="/profile">
          <img src="/icon/user-regular.svg" alt="User Icon" class="w-6 h-6" />
        </router-link>

        <span class="font-semibold">{{ storeName || 'RuangJayaPrint' }}</span>
      </div>
    </div>
  </header>
</template>

<script>
import axios from 'axios'

export default {
  props: {
    showSearch: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      unreadNotifications: 0,
      notificationTimer: null,
      storeName: '',
      apiUrls: [
        `${import.meta.env.VITE_API_BASE_URL}/seller/notifikasi/count`,
        '/api/seller/notifikasi/count',
        `${import.meta.env.VITE_API_BASE_URL}/seller/notifikasi/count`,
      ],
    }
  },
  methods: {
    toggleSidebar() {
      this.$emit('toggle-sidebar')
    },
    async fetchNotificationCount() {
      // Get token from localStorage
      const token = localStorage.getItem('token')

      if (!token) {
        console.warn('No authentication token found')
        return
      }

      // Try each API URL in sequence
      for (const apiUrl of this.apiUrls) {
        try {
          const response = await axios.get(apiUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.data && response.data.status === 'success') {
            this.unreadNotifications = response.data.data.belum_terbaca
            return // Success, exit the loop
          }
        } catch (error) {
          console.log(`Failed to fetch from ${apiUrl}:`, error)
          // Continue to the next URL
        }
      }

      // If all attempts fail
      console.error('Failed to fetch notification count from all API endpoints')
    },
    fetchStoreInfo() {
      // Get token from localStorage
      const token = localStorage.getItem('token')

      if (!token) {
        console.warn('No authentication token found')
        return
      }

      // Try to fetch store information
      axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/seller/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data && response.data.status === 'success') {
            this.storeName = response.data.data.nama_toko || 'RuangJayaPrint'
          }
        })
        .catch((error) => {
          console.error('Error fetching store information:', error)
        })
    },
  },
  mounted() {
    // Fetch notification count when component is mounted
    this.fetchNotificationCount()
    this.fetchStoreInfo()

    // Set up polling to periodically check for new notifications
    // Update every 1 minute (60000 milliseconds)
    this.notificationTimer = setInterval(() => {
      this.fetchNotificationCount()
    }, 60000)
  },
  beforeUnmount() {
    // Clear interval when component is unmounted to prevent memory leaks
    if (this.notificationTimer) {
      clearInterval(this.notificationTimer)
    }
  },
}
</script>

<style scoped>
/* Header Seller Responsiveness */
@media (max-width: 1024px) {
  #mainHeader {
    padding-top: 20px;
    padding-bottom: 20px;
  }
}
</style>
