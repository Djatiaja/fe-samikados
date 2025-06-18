<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <HeaderSeller @toggle-sidebar="toggleSidebar" :showSearch="true">
      <template #search>
        <div class="relative w-full">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari pengiriman..."
            class="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 bg-white text-black"
            @input="debouncedSearch"
          />
          <div class="absolute left-4 top-3">
            <img
              src="/icon/magnifying-glass-solid.svg"
              alt="Search"
              class="h-4 w-4 text-gray-400"
            />
          </div>
        </div>
      </template>
    </HeaderSeller>

    <!-- Sidebar -->
    <SidebarSeller :isSidebarActive="isSidebarActive" />

    <!-- Content Wrapper -->
    <div
      class="content-wrapper bg-gray-100 flex-1 mt-32 sm:mt-32 md:mt-16"
      :class="{ 'lg:ml-64': isSidebarActive }"
    >
      <div class="p-4 md:p-6 lg:p-8">
        <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6">Notifikasi</h2>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center">
          <div
            class="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full"
          ></div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="apiError"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
        >
          <div class="flex items-center">
            <div class="py-1 mr-2">
              <svg
                class="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium">Terjadi kesalahan saat mengambil notifikasi!</p>
              <p class="text-sm">
                Silakan periksa koneksi jaringan atau coba lagi.
                <button @click="fetchNotifs" class="underline text-red-600 hover:text-red-800">
                  Coba Lagi
                </button>
              </p>
            </div>
          </div>
        </div>

        <!-- Notifications or No Data -->
        <div v-else>
          <NotifCard
            v-for="notif in filteredNotifs"
            :key="notif.id"
            :title="notif.title"
            :message="notif.message"
            :date_time="formatDate(notif.created_at)"
          />
          <div v-if="filteredNotifs.length === 0" class="text-center text-gray-600 mt-4">
            Tidak ada notifikasi yang ditemukan
          </div>
        </div>
      </div>
    </div>

    <FooterSeller />
  </div>
</template>

<script>
import { debounce } from 'lodash'
import HeaderSeller from '@/components/HeaderSeller.vue'
import SidebarSeller from '@/components/SidebarSeller.vue'
import FooterSeller from '@/components/FooterSeller.vue'
import NotifCard from '@/components/NotifCard.vue'
import axios from 'axios'

export default {
  components: { HeaderSeller, SidebarSeller, FooterSeller, NotifCard },
  data() {
    return {
      isSidebarActive: false,
      isMobile: window.innerWidth < 1024,
      searchQuery: '',
      notifs: [],
      isLoading: false,
      apiError: false,
    }
  },
  computed: {
    filteredNotifs() {
      if (!this.searchQuery) return this.notifs
      const query = this.searchQuery.toLowerCase()
      return this.notifs.filter(
        (notif) =>
          notif.title.toLowerCase().includes(query) || notif.message.toLowerCase().includes(query),
      )
    },
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)
    this.fetchNotifs()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    debouncedSearch: debounce(function () {
      // Trigger search filter on input
    }, 300),
    toggleSidebar() {
      if (this.isMobile) {
        this.isSidebarActive = !this.isSidebarActive
      }
    },
    handleResize() {
      this.isMobile = window.innerWidth < 1024
      this.isSidebarActive = !this.isMobile
    },
    async fetchNotifs() {
      this.isLoading = true
      this.apiError = false
      try {
        const token = localStorage.getItem('token')
        console.log('Token:', token) // Debug token
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/seller/notifikasi`) // Debug URL
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/seller/notifikasi`)
        if (res.data.status === 'success') {
          this.notifs = res.data.data || []
          await this.markAsRead()
        } else {
          throw new Error(res.data.message || 'Failed to fetch notifications')
        }
      } catch (error) {
        console.error('Gagal fetch notifikasi:', error.response?.data || error.message)
        if (error.response?.status === 401) {
          console.error('Unauthorized: Invalid or expired token')
          // Optional: this.$router.push('/login')
        }
        this.apiError = true
      } finally {
        console.log('Finally block executed') // Debug finally
        this.isLoading = false
      }
    },
    async markAsRead() {
      try {
        const token = localStorage.getItem('token')
        console.log('Token:', token) // Debug token
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/seller/notifikasi`) // Debug URL
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/seller/notifikasi`)
      } catch (error) {
        console.error('Gagal update is_read:', error.response?.data || error.message)
        if (error.response?.status === 401) {
          console.error('Unauthorized: Invalid or expired token')
        }
      }
    },
    formatDate(dateStr) {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }
      return new Date(dateStr).toLocaleString('id-ID', options)
    },
  },
}
</script>
