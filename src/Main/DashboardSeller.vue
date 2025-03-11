<template>
  <div class="flex flex-col min-h-screen">
    <!-- Overlay for sidebar on mobile -->
    <div 
      id="overlay" 
      :class="{ 'block': isSidebarActive && isMobile, 'hidden': !isSidebarActive || !isMobile }" 
      @click="toggleSidebar"
      class="fixed inset-0 bg-opacity-20 z-20"
    ></div>

    <!-- Header -->
    <HeaderSeller @toggle-sidebar="toggleSidebar" />

    <!-- Sidebar -->
    <SidebarSeller :isSidebarActive="isSidebarActive" />

    <!-- Content Wrapper -->
    <div 
      class="content-wrapper bg-gray-100 flex-1 mt-32 sm:mt-32 md:mt-16" 
      :class="{ 'lg:ml-64': isSidebarActive }"
    >
      <div class="p-4 md:p-6 lg:p-8">
        <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6">Dashboard</h2>

        <!-- Statistik Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard imgSrc="/image/sold.png" title="Total Produk Terjual" value="174" subtitle="Produk Terjual" />
          <StatCard imgSrc="/image/order.png" title="Pesanan dalam Proses" value="27" subtitle="Sedang Diproses" />
          <StatCard imgSrc="/image/managed-category.png" title="Kategori yang Dikelola" value="4" subtitle="Kategori Dikelola" />
          <StatCard imgSrc="/image/managed-products.png" title="Produk yang Dikelola" value="97" subtitle="Produk Dikelola" />
          <StatCard imgSrc="/image/rating.png" title="Rating" value="4.8/5" subtitle="Kerja Bagus!" />
          <StatCard imgSrc="/image/income-statistics.png" title="Statistik Penjualan" value="Rp 50,000,000" subtitle="Pendapatan Bulan Ini" />
        </div>

        <!-- Grafik Statistik -->
        <div class="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md mb-8">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h3 class="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-0">Grafik Pesanan Bulanan</h3>
            <select v-model="selectedYear" class="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-red-600">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <div class="chart-container" style="position: relative; height: 400px; width: 100%;">
            <canvas ref="orderChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <FooterSeller />
  </div>
</template>




<script>
import HeaderSeller from "@/components/HeaderSeller.vue";
import SidebarSeller from "@/components/SidebarSeller.vue";
import FooterSeller from "@/components/FooterSeller.vue";
import Chart from "chart.js/auto";
import StatCard from "@/components/StatCard.vue";

export default {
  components: { HeaderSeller, SidebarSeller, FooterSeller, StatCard },
  data() {
    return {
      isSidebarActive: false,
      isMobile: window.innerWidth < 1024,
      selectedYear: 2023,
      years: [2024, 2023, 2022, 2021],
      dataPerTahun: {
        2024: [1200000, 1500000, 1000000, 1800000, 2200000, 2500000, 2100000, 2300000, 1900000, 2000000, 2700000, 3000000],
        2023: [1000000, 1300000, 900000, 1500000, 2000000, 2400000, 2000000, 2200000, 1700000, 1900000, 2500000, 2800000],
        2022: [800000, 1100000, 700000, 1300000, 1800000, 2200000, 1900000, 2100000, 1500000, 1700000, 2200000, 2600000],
        2021: [600000, 900000, 500000, 1200000, 1500000, 2000000, 1800000, 2000000, 1300000, 1500000, 1900000, 2300000],
      },
      orderChart: null,
    };
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024;
    this.isSidebarActive = !this.isMobile;
    window.addEventListener('resize', this.handleResize);
    this.$nextTick(() => {
      this.renderChart();
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.orderChart) {
      this.orderChart.destroy();
    }
  },
  methods: {
    toggleSidebar() {
      if (this.isMobile) {
        this.isSidebarActive = !this.isSidebarActive;
    }
    },
    handleResize() {
      this.isMobile = window.innerWidth < 1024;  // Cek apakah ukuran layar mobile
      if (this.isMobile) {
        this.isSidebarActive = false;  // Sidebar tersembunyi pada layar mobile
      } else {
        this.isSidebarActive = true;
      }
    },
    renderChart() {
      const ctx = this.$refs.orderChart.getContext("2d");
      this.orderChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
          datasets: [{
            label: "Penjualan",
            data: this.dataPerTahun[this.selectedYear],
            borderColor: "rgba(220, 53, 69, 1)",
            backgroundColor: "rgba(220, 53, 69, 0.1)",
            borderWidth: 2,
            fill: false,
            tension: 0.1
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Jumlah Penjualan (Rp)",
                color: "#DC3545",
                font: { size: 14, weight: "bold" },
              },
              ticks: {
                callback: (value) => "Rp " + value.toLocaleString(),
              },
            },
            x: {
              title: {
                display: true,
                text: "Bulan",
                color: "#DC3545",
                font: { size: 14, weight: "bold" },
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
                label: (context) => "Rp " + context.parsed.y.toLocaleString(),
              }
            }
          }
        },
      });
    },
    updateChart() {
      if (this.orderChart) {
        this.orderChart.data.datasets[0].data = this.dataPerTahun[this.selectedYear];
        this.orderChart.update();
      }
    },
  },
};
</script>