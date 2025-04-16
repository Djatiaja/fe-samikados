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

        <!-- Loading indicator -->
        <div v-if="loading" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
        </div>

        <div v-else>
          <!-- Statistik Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <StatCard imgSrc="/image/sold.png" title="Total Produk Terjual" :value="dashboardData.jumlahProdukTerjual.toString()" subtitle="Produk Terjual" />
            <StatCard imgSrc="/image/order.png" title="Pesanan dalam Proses" :value="dashboardData.prosesOrder.toString()" subtitle="Sedang Diproses" />
            <StatCard imgSrc="/image/managed-category.png" title="Kategori yang Dikelola" :value="dashboardData.total_kategori.toString()" subtitle="Kategori Dikelola" />
            <StatCard imgSrc="/image/managed-products.png" title="Produk yang Dikelola" :value="dashboardData.total_produk.toString()" subtitle="Produk Dikelola" />
            <StatCard imgSrc="/image/rating.png" title="Rating" value="4.8/5" subtitle="Kerja Bagus!" />
            <StatCard imgSrc="/image/income-statistics.png" title="Statistik Penjualan" :value="`Rp ${formatCurrency(dashboardData.totalPenjualan)}`" subtitle="Pendapatan Bulan Ini" />
          </div>

          <!-- Grafik Statistik -->
          <div class="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md mb-8">
            <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h3 class="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-0">Grafik Pesanan Bulanan</h3>
              <select 
                class="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-red-600"
                @change="changeYear($event)"
              >
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
            <div class="chart-container" style="position: relative; height: 400px; width: 100%;">
              <canvas id="orderChart"></canvas>
            </div>
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
import axios from "axios";

export default {
  components: { HeaderSeller, SidebarSeller, FooterSeller, StatCard },
  data() {
    return {
      isSidebarActive: false,
      isMobile: window.innerWidth < 1024,
      loading: true,
      selectedYear: new Date().getFullYear().toString(),
      availableYears: [],
      dashboardData: {
        total_produk: 0,
        total_kategori: 0,
        prosesOrder: 0,
        jumlahProdukTerjual: 0,
        totalPenjualan: 0,
        grafik: {}
      },
      orderChart: null
    };
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024;
    this.isSidebarActive = !this.isMobile;
    window.addEventListener('resize', this.handleResize);
    
    // Fetch dashboard data from API
    this.fetchDashboardData();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.orderChart) {
      this.orderChart.destroy();
    }
  },
  methods: {
    fetchDashboardData() {
      this.loading = true;
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      axios.get('http://127.0.0.1:8000/api/seller/dashboard')
        .then(response => {
          if (response.data.status === 'success') {
            this.dashboardData = response.data.data;
            
            // Get available years from the grafik data
            this.availableYears = Object.keys(this.dashboardData.grafik).sort().reverse();
            
            // Set default selected year to the most recent one
            if (this.availableYears.length > 0) {
              this.selectedYear = this.availableYears[0];
            }
            
            // Initialize chart after data is loaded
            setTimeout(() => {
              this.initializeChart();
            }, 200);
          } else {
            console.error('Failed to fetch dashboard data:', response.data.error);
          }
        })
        .catch(error => {
          console.error('API request failed:', error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    
    formatCurrency(value) {
      return new Intl.NumberFormat('id-ID').format(value);
    },
    
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
    
    // Changed to use HTML id instead of Vue ref
    initializeChart() {
      // Destroy existing chart if it exists
      if (this.orderChart) {
        this.orderChart.destroy();
      }
      
      const ctx = document.getElementById('orderChart').getContext('2d');
      if (!ctx) {
        console.error('Cannot find chart context');
        return;
      }
      
      const monthlyData = this.getMonthlyDataForYear(this.selectedYear);
      
      this.orderChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
          datasets: [{
            label: "Pesanan",
            data: monthlyData,
            borderColor: "rgba(220, 53, 69, 1)",
            backgroundColor: "rgba(220, 53, 69, 0.1)",
            borderWidth: 2,
            fill: true,
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
                text: "Jumlah Pesanan (Order)",
                color: "#DC3545",
                font: { size: 14, weight: "bold" },
              },
              ticks: {
                callback: (value) => value.toString(),
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
                label: (context) => `${context.parsed.y} Pesanan`
              }
            }
          }
        },
      });
    },
    
    // Changed to handle year selection differently
    changeYear(event) {
      this.selectedYear = event.target.value;
      
      // Always recreate the chart when year changes
      if (this.orderChart) {
        this.orderChart.destroy();
      }
      
      this.initializeChart();
    },
    
    getMonthlyDataForYear(year) {
      const monthlyData = [];
      
      // Check if the year exists in grafik data
      if (this.dashboardData.grafik[year]) {
        // For each month (01-12), get the totalPesanan
        for (let month = 1; month <= 12; month++) {
          const monthStr = month.toString().padStart(2, '0');
          
          if (this.dashboardData.grafik[year][monthStr] && 
              this.dashboardData.grafik[year][monthStr].totalPesanan !== undefined) {
            monthlyData.push(this.dashboardData.grafik[year][monthStr].totalPesanan);
          } else {
            // If no data for this month, use 0
            monthlyData.push(0);
          }
        }
      } else {
        // If no data for this year, fill with zeros
        for (let i = 0; i < 12; i++) {
          monthlyData.push(0);
        }
      }
      
      return monthlyData;
    }
  },
};
</script>