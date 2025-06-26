<template>
  <header class="bg-gradient-to-r from-red-600 to-black text-white p-4 sticky top-0 z-20">
    <div class="container mx-auto flex justify-between items-center">
      <!-- Nama toko dinamis di kiri -->
      <h1 class="text-md sm:text-lg lg:text-2xl font-bold">
        {{ userData.name || 'SAMIKADOS' }}
      </h1>

      <!-- Search Bar di tengah -->
      <div v-if="showSearch" class="relative w-1/2 md:w-1/2 lg:w-1/2 mx-auto">
        <input
          type="text"
          :placeholder="searchPlaceholder"
          v-model="searchQuery"
          class="w-full pl-10 pr-4 py-2 text-xs sm:text-sm lg:text-lg rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
        />
        <img
          src="/icon/magnifying-glass-solid.svg"
          alt="Search Icon"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4"
        />
      </div>

      <!-- Teks SELLER di kanan -->
      <a href="/dashboard-seller" class="text-xs sm:text-sm lg:text-lg"> SELLER </a>
    </div>
  </header>
</template>

<script>
import axios from 'axios'

export default {
  props: {
    showSearch: {
      type: Boolean,
      default: true,
    },
    searchPlaceholder: {
      type: String,
      default: 'Search...',
    },
  },
  data() {
    return {
      searchQuery: '',
      userData: {
        name: null,
      },
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      loading: false,
      error: null,
    }
  },
  mounted() {
    this.fetchUserData()
  },
  methods: {
    async fetchUserData() {
      this.loading = true
      this.error = null

      const token = localStorage.getItem('token')
      if (!token) {
        this.error = 'No token found'
        this.$router.push('/login')
        return
      }

      try {
        const response = await axios.get(`${this.baseUrl}/seller/data`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.status === 'success') {
          this.userData = {
            name: response.data.data.name || null,
          }
        } else {
          this.error = response.data.message || 'Failed to load profile data'
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
        this.error = error.response?.data?.message || 'Failed to load profile data'
        if (error.response?.status === 401) {
          this.$router.push('/login')
        }
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
