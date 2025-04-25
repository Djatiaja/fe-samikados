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
        <div>
          <NotifCard
            v-for="notif in notifs"
            :key="notif.id"
            :title="notif.title"
            :message="notif.message"
            :date_time="formatDate(notif.created_at)"
          />
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
import NotifCard from '@/components/NotifCard.vue'
import axios from 'axios'

export default {
  components: { HeaderSeller, SidebarSeller, FooterSeller, NotifCard },
  data() {
    return {
      isSidebarActive: false,
      isMobile: window.innerWidth < 1024,
      statusFilter: 'all',
      entriesPerPage: 25,
      searchQuery: '',
      notifs: [],
    }
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
      try {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const res = await axios.get(`http://127.0.0.1:8000/api/seller/notifikasi`)
        if (res.data.status === 'success') {
          this.notifs = res.data.data
          this.markAsRead()
        }
      } catch (error) {
        console.error('Gagal fetch notifikasi:', error)
      }
    },
    async markAsRead() {
      try {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await axios.post(`http://127.0.0.1:8000/api/seller/notifikasi`)
      } catch (error) {
        console.error('Gagal update is_read:', error)
      }
    },
    formatDate(dateStr) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }
      return new Date(dateStr).toLocaleString('id-ID', options)
    },
  },
}
</script>
