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
    <HeaderSeller @toggle-sidebar="toggleSidebar" />
    <!-- Sidebar -->
    <SidebarSeller :isSidebarActive="isSidebarActive" />

    <div
      class="content-wrapper bg-gray-100 flex-1 mt-32 sm:mt-32 md:mt-16"
      :class="{ 'lg:ml-64': isSidebarActive }"
    >
      <!-- Content -->
      <div class="p-4 md:p-6 lg:p-8">
        <h2 class="text-2xl md:text-3xl font-bold mb-6">Laporan</h2>

        <!-- API Error Banner -->
        <div v-if="apiError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div class="flex items-center">
            <div class="py-1 mr-2">
              <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <p class="font-medium">Terjadi kesalahan saat mengambil data!</p>
              <p class="text-sm">Silakan periksa koneksi jaringan atau hubungi administrator.</p>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading && !apiError" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>

        <!-- Demo mode notice -->
        <div v-if="demoMode" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <p class="font-medium">Mode Demo Aktif</p>
          <p class="text-sm">Menampilkan data contoh karena API tidak tersedia.</p>
        </div>

        <!-- Report Data -->
        <div v-if="!loading || demoMode">
          <!-- Ringkasan Laporan -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <ReportCard
              imgSrc="/image/ProfitIcon.png"
              title="Total Pendapatan"
              :value="formatCurrency(reportData.Total_pendapatan)"
            />
            <ReportCard
              imgSrc="/image/IncomeIcon.png"
              title="Saldo Aktif"
              :value="formatCurrency(reportData.Saldo_aktif)"
            />
            <ReportCard
              imgSrc="/image/LossIcon.png"
              title="Saldo Tercairkan"
              :value="formatCurrency(reportData.Saldo_tercairkan)"
            />
          </div>

          <!-- Grafik Statistik -->
          <div class="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md mb-8">
            <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h3 class="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-0">Grafik Penjualan</h3>
              <select
                v-model="selectedYear"
                class="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-red-600"
              >
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
            <div class="chart-container relative h-96 w-full">
              <canvas ref="salesChart"></canvas>
              <!-- Fallback message if chart fails to load -->
              <div v-if="chartError" class="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80">
                <div class="text-center p-4">
                  <svg class="h-10 w-10 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <p class="font-medium">Grafik tidak dapat ditampilkan</p>
                  <p class="text-sm">Silakan muat ulang halaman atau hubungi administrator.</p>
                  <button @click="tryRenderChart" class="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
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
import ReportCard from '@/components/ReportCard.vue'
import Chart from 'chart.js/auto'
import axios from 'axios'

export default {
  components: { HeaderSeller, SidebarSeller, FooterSeller, ReportCard },
  data() {
    return {
      isSidebarActive: false,
      isMobile: window.innerWidth < 1024,
      selectedYear: new Date().getFullYear().toString(),
      availableYears: [],
      reportData: {
        Total_pendapatan: 0,
        Saldo_aktif: 0,
        Saldo_tercairkan: 0,
        grafik_penjualan: {}
      },
      salesChart: null,
      loading: true,
      apiError: false,
      demoMode: false,
      chartError: false,
      // API URLs to try in order
      apiUrls: [
        'http://127.0.0.1:8000/api/seller/laporan',
        '/api/seller/laporan',
        'http://localhost:8000/api/seller/laporan'
      ]
    }
  },
  mounted() {
    this.isSidebarActive = !this.isMobile
    window.addEventListener('resize', this.handleResize)
    this.fetchReportData()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    if (this.salesChart) {
      this.salesChart.destroy()
    }
  },
  watch: {
    selectedYear() {
      this.updateChart()
    },
  },
  methods: {
    formatCurrency(value) {
      return 'Rp' + value.toLocaleString('id-ID')
    },
    async fetchReportData() {
      this.loading = true
      this.apiError = false
      this.chartError = false

      // Try each API URL in sequence
      for (const apiUrl of this.apiUrls) {
        try {
          const token = localStorage.getItem('token');
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get(apiUrl)

          if (response.data && response.data.status === 'success') {
            this.reportData = response.data.data
            this.availableYears = Object.keys(this.reportData.grafik_penjualan).sort().reverse()

            // Set default year to the latest available
            if (this.availableYears.length > 0) {
              this.selectedYear = this.availableYears[0]
            }

            this.loading = false
            await this.$nextTick()
            this.tryRenderChart()
            return // Success, exit the loop
          }
        } catch (error) {
          console.log(`Failed to fetch from ${apiUrl}:`, error)
          // Continue to the next URL
        }
      }

      // If we get here, all API attempts failed
      this.apiError = true
      this.loading = false

      // Fall back to demo mode with sample data
      this.activateDemoMode()
    },
    activateDemoMode() {
      this.demoMode = true
      // Sample data for demo mode
      this.reportData = {
        Total_pendapatan: 287482000,
        Saldo_aktif: 287482000,
        Saldo_tercairkan: 0,
        grafik_penjualan: {
          "2024": {
            "01": { "penjualan": 3133000 },
            "02": { "penjualan": 5309000 },
            "03": { "penjualan": 16972000 },
            "04": { "penjualan": 1807000 },
            "05": { "penjualan": 1443000 },
            "06": { "penjualan": 4139000 },
            "07": { "penjualan": 2354000 },
            "08": { "penjualan": 3066000 },
            "09": { "penjualan": 14433000 },
            "10": { "penjualan": 4921000 },
            "11": { "penjualan": 13174000 },
            "12": { "penjualan": 5408000 }
          },
          "2023": {
            "01": { "penjualan": 1930000 },
            "02": { "penjualan": 3936000 },
            "03": { "penjualan": 11946000 },
            "04": { "penjualan": 1877000 },
            "05": { "penjualan": 1954000 },
            "06": { "penjualan": 5593000 },
            "07": { "penjualan": 3726000 },
            "08": { "penjualan": 2228000 },
            "09": { "penjualan": 0 },
            "10": { "penjualan": 0 },
            "11": { "penjualan": 3532000 },
            "12": { "penjualan": 3938000 }
          },
          "2025": {
            "01": { "penjualan": 7419000 },
            "02": { "penjualan": 6704000 },
            "03": { "penjualan": 4107000 },
            "04": { "penjualan": 7104000 },
            "05": { "penjualan": 6558000 },
            "06": { "penjualan": 12033000 },
            "07": { "penjualan": 8874000 },
            "08": { "penjualan": 4222000 },
            "09": { "penjualan": 5875000 },
            "10": { "penjualan": 2189000 },
            "11": { "penjualan": 2788000 },
            "12": { "penjualan": 6339000 }
          }
        }
      }

      this.availableYears = Object.keys(this.reportData.grafik_penjualan).sort().reverse()

      if (this.availableYears.length > 0) {
        this.selectedYear = this.availableYears[0]
      }

      // Ensure DOM is updated before rendering chart
      this.$nextTick(() => {
        this.tryRenderChart()
      })
    },
    toggleSidebar() {
      this.isSidebarActive = !this.isSidebarActive
    },
    handleResize() {
      this.isMobile = window.innerWidth < 1024
      this.isSidebarActive = !this.isMobile

      // Re-render chart on resize to ensure proper scaling
      if (this.salesChart) {
        this.$nextTick(() => {
          this.updateChart()
        })
      }
    },
    getMonthlyData(year) {
      const yearData = this.reportData.grafik_penjualan[year] || {}
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ]

      return monthNames.map((_, index) => {
        const monthKey = String(index + 1).padStart(2, '0')
        return yearData[monthKey]?.penjualan || 0
      })
    },
    tryRenderChart() {
      try {
        this.chartError = false
        this.renderChart()
      } catch (error) {
        console.error('Error rendering chart:', error)
        this.chartError = true
      }
    },
    renderChart() {
      // Clear any existing chart
      if (this.salesChart) {
        this.salesChart.destroy()
        this.salesChart = null
      }

      // Check if canvas element exists
      if (!this.$refs.salesChart) {
        console.error('Chart canvas element not found')
        this.chartError = true
        return
      }

      const ctx = this.$refs.salesChart.getContext('2d')
      if (!ctx) {
        console.error('Failed to get 2D context from canvas')
        this.chartError = true
        return
      }

      // Create the chart
      this.salesChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
          ],
          datasets: [
            {
              label: 'Penjualan',
              data: this.getMonthlyData(this.selectedYear),
              borderColor: 'rgba(220, 53, 69, 1)',
              backgroundColor: 'rgba(220, 53, 69, 0.2)',
              borderWidth: 2,
              fill: true,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Jumlah (Rp)',
                color: '#DC3545',
                font: { size: 14, weight: 'bold' },
              },
              ticks: {
                callback: (value) => 'Rp ' + value.toLocaleString('id-ID'),
              },
            },
            x: {
              title: {
                display: true,
                text: 'Bulan',
                color: '#DC3545',
                font: { size: 14, weight: 'bold' },
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (context) => 'Rp ' + context.parsed.y.toLocaleString('id-ID'),
              },
            },
          },
        },
      })
    },
    updateChart() {
      if (!this.salesChart) {
        this.tryRenderChart()
        return
      }

      try {
        this.salesChart.data.datasets[0].data = this.getMonthlyData(this.selectedYear)
        this.salesChart.update()
      } catch (error) {
        console.error('Error updating chart:', error)
        this.chartError = true
        this.tryRenderChart() // Try to rebuild the chart
      }
    },
  },
}
</script>
