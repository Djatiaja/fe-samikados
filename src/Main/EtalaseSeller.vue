<template>
  <div class="flex flex-col min-h-screen">
    <!-- Overlay for sidebar on mobile -->
    <div
      id="overlay"
      :class="{ block: isSidebarActive && isMobile, hidden: !isSidebarActive || !isMobile }"
      @click="toggleSidebar"
      class="fixed inset-0 bg-opacity-20 z-20"
    ></div>

    <!-- Header -->
    <HeaderSeller @toggle-sidebar="toggleSidebar" :showSearch="true">
      <template #search>
        <div class="relative w-full">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari produk..."
            class="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 bg-white text-black"
            @input="searchProducts"
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
        <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6 mt-12 lg:mt-3">Etalase</h2>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-10">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
        >
          <p>{{ error }}</p>
          <button @click="fetchEtalaseData" class="mt-2 bg-red-600 text-white px-4 py-2 rounded">
            Coba Lagi
          </button>
        </div>

        <!-- Content -->
        <div v-else>
          <!-- Categories Section -->
          <div v-for="(category, index) in categories" :key="index" class="mb-8">
            <div class="flex mb-4">
              <h2 class="text-xl font-semibold">{{ category.name }}</h2>
            </div>

            <!-- Products -->
            <div v-if="category.product && category.product.length > 0" class="overflow-x-auto">
              <div class="grid grid-flow-col auto-cols-max gap-x-4 max-w-screen-lg">
                <!-- Product Card -->
                <article
                  v-for="product in category.product"
                  :key="product.id"
                  class="bg-red-600 text-white p-3 rounded-lg inline-block"
                >
                  <img
                    :src="product.thumbnail || `/api/placeholder/250/250?text=${product.name}`"
                    :alt="product.name"
                    class="w-full mb-4"
                  />
                  <h4 class="font-bold">{{ product.name }}</h4>
                  <p>Rp{{ formatPrice(product.price) }}</p>
                  <p class="text-sm">{{ product.unit }}+ Terjual</p>
                </article>
              </div>
            </div>

            <!-- Empty state for category -->
            <div v-else class="bg-gray-50 rounded-lg p-4 text-center">
              <p>Tidak ada produk dalam kategori ini</p>
            </div>
          </div>

          <!-- Empty state if no categories -->
          <div v-if="categories.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
            <p class="text-lg text-gray-600">Tidak ada kategori etalase yang tersedia</p>
          </div>
        </div>
      </div>
    </div>

    <FooterSeller />
  </div>
</template>

<script>
import HeaderSeller from '@/components/HeaderSeller.vue'
import SidebarSeller from '@/components/SidebarSeller.vue'
import FooterSeller from '@/components/FooterSeller.vue'
import axios from 'axios'

export default {
  components: { HeaderSeller, SidebarSeller, FooterSeller },
  data() {
    return {
      isSidebarActive: false,
      isMobile: window.innerWidth < 1024,
      statusFilter: 'all',
      entriesPerPage: 25,
      searchQuery: '',
      categories: [],
      loading: true,
      error: null,
      baseUrl: 'http://127.0.0.1:8000/api',
    }
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)
    this.fetchEtalaseData()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    toggleSidebar() {
      if (this.isMobile) {
        this.isSidebarActive = !this.isSidebarActive
      }
    },
    handleResize() {
      this.isMobile = window.innerWidth < 1024
      this.isSidebarActive = !this.isMobile
    },
    async fetchEtalaseData() {
      this.loading = true
      this.error = null

      try {
        // Get token from localStorage
        const token = localStorage.getItem('token') || ''

        const response = await axios.get(`${this.baseUrl}/seller/etalase`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })

        if (response.data && response.data.data) {
          this.categories = Object.values(response.data.data).flat()
        } else {
          this.categories = []
        }

        this.loading = false
      } catch (err) {
        console.error('Error fetching etalase data:', err)
        this.error = 'Gagal memuat data etalase. Silakan coba lagi.'
        this.loading = false

        // Redirect to login if unauthorized
        if (err.response && err.response.status === 401) {
          this.$router.push('/login')
        }
      }
    },
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    },
    searchProducts() {
      if (this.searchQuery.length > 2) {
        console.log('Searching for:', this.searchQuery)
      }
    },
  },
}
</script>
