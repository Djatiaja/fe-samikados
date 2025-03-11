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

        <!-- Ringkasan Laporan -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <ReportCard
            imgSrc="/image/ProfitIcon.png"
            title="Total Pendapatan"
            value="Rp34.572.980"
          />
          <ReportCard imgSrc="/image/IncomeIcon.png" title="Saldo Aktif" value="Rp13.234.050" />
          <ReportCard imgSrc="/image/LossIcon.png" title="Saldo Tercairkan" value="Rp0" />
        </div>

        <!-- Grafik Statistik -->
        <div class="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md mb-8">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h3 class="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-0">Grafik Penjualan</h3>
            <select
              v-model="selectedYear"
              class="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-red-600"
            >
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <div class="chart-container" style="position: relative; height: 400px; width: 100%">
            <canvas ref="salesChart"></canvas>
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

export default {
  components: { HeaderSeller, SidebarSeller, FooterSeller, ReportCard },
  data() {
    return {
      isSidebarActive: false,
      isMobile: window.innerWidth < 1024,
      selectedYear: 2024,
      years: [2024, 2023, 2022, 2021],
      salesData: {
        2024: [1200000, 1500000, 1000000, 1800000, 2200000, 2500000],
        2023: [1000000, 1300000, 900000, 1600000, 2100000, 2400000],
        2022: [900000, 1100000, 800000, 1400000, 2000000, 2300000],
        2021: [800000, 1000000, 700000, 1200000, 1800000, 2000000],
      },
      salesChart: null,
    }
  },
  mounted() {
    this.isSidebarActive = !this.isMobile
    window.addEventListener('resize', this.handleResize)
    this.$nextTick(() => {
      this.renderChart()
    })
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
    toggleSidebar() {
      this.isSidebarActive = !this.isSidebarActive
    },
    handleResize() {
      this.isMobile = window.innerWidth < 1024
      this.isSidebarActive = !this.isMobile
    },
    renderChart() {
      const ctx = this.$refs.salesChart.getContext('2d')
      this.salesChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'],
          datasets: [
            {
              label: 'Penjualan',
              data: this.salesData[this.selectedYear],
              borderColor: 'rgba(220, 53, 69, 1)',
              backgroundColor: 'rgba(220, 53, 69, 0.2)',
              borderWidth: 2,
              fill: false,
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
                callback: (value) => 'Rp ' + value.toLocaleString(),
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
                label: (context) => 'Rp ' + context.parsed.y.toLocaleString(),
              },
            },
          },
        },
      })
    },
    updateChart() {
      if (this.salesChart) {
        this.salesChart.data.datasets[0].data = this.salesData[this.selectedYear]
        this.salesChart.update()
      }
    },
  },
}
</script>
