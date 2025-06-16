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
          <div
            v-if="apiError"
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
                <p class="font-medium">Terjadi kesalahan saat mengambil data!</p>
                <p class="text-sm">Silakan periksa koneksi jaringan atau hubungi administrator.</p>
              </div>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="loading && !apiError" class="flex justify-center items-center py-20">
            <div
              class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"
            ></div>
          </div>

          <!-- Demo mode notice -->
          <div
            v-if="demoMode"
            class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6"
          >
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

            <!-- Export Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                @click="exportToExcel"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Export ke Excel
              </button>
              <button
                @click="exportToPDF"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Export ke PDF
              </button>
            </div>

            <!-- Grafik Statistik -->
            <div class="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md mb-8">
              <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h3 class="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-0">
                  Grafik Penjualan
                </h3>
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
                <div
                  v-if="chartError"
                  class="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80"
                >
                  <div class="text-center p-4">
                    <svg
                      class="h-10 w-10 text-red-500 mx-auto mb-2"
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
                    <p class="font-medium">Grafik tidak dapat ditampilkan</p>
                    <p class="text-sm">Silakan muat ulang halaman atau hubungi administrator.</p>
                    <button
                      @click="tryRenderChart"
                      class="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
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
  import * as XLSX from 'xlsx' // Import xlsx for Excel export
  import jsPDF from 'jspdf' // Import jsPDF for PDF export
  import html2canvas from 'html2canvas' // Import html2canvas for chart screenshot

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
          grafik_penjualan: {},
        },
        salesChart: null,
        loading: true,
        apiError: false,
        demoMode: false,
        chartError: false,
        apiUrls: [
          'http://127.0.0.1:8000/api/seller/laporan',
          '/api/seller/laporan',
          'http://localhost:8000/api/seller/laporan',
        ],
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

        for (const apiUrl of this.apiUrls) {
          try {
            const token = localStorage.getItem('token')
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            const response = await axios.get(apiUrl)

            if (response.data && response.data.status === 'success') {
              this.reportData = response.data.data
              this.availableYears = Object.keys(this.reportData.grafik_penjualan).sort().reverse()

              if (this.availableYears.length > 0) {
                this.selectedYear = this.availableYears[0]
              }

              this.loading = false
              await this.$nextTick()
              this.tryRenderChart()
              return
            }
          } catch (error) {
            console.log(`Failed to fetch from ${apiUrl}:`, error)
          }
        }

        this.apiError = true
        this.loading = false
      },
      toggleSidebar() {
        this.isSidebarActive = !this.isSidebarActive
      },
      handleResize() {
        this.isMobile = window.innerWidth < 1024
        this.isSidebarActive = !this.isMobile

        if (this.salesChart) {
          this.$nextTick(() => {
            this.updateChart()
          })
        }
      },
      getMonthlyData(year) {
        const yearData = this.reportData.grafik_penjualan[year] || {}
        const monthNames = [
          'Januari',
          'Februari',
          'Maret',
          'April',
          'Mei',
          'Juni',
          'Juli',
          'Agustus',
          'September',
          'Oktober',
          'November',
          'Desember',
        ]

        return monthNames.map((month, index) => {
          const monthKey = String(index + 1).padStart(2, '0')
          return { month, sales: yearData[monthKey]?.penjualan || 0 }
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
        if (this.salesChart) {
          this.salesChart.destroy()
          this.salesChart = null
        }

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

        this.salesChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: [
              'Januari',
              'Februari',
              'Maret',
              'April',
              'Mei',
              'Juni',
              'Juli',
              'Agustus',
              'September',
              'Oktober',
              'November',
              'Desember',
            ],
            datasets: [
              {
                label: 'Penjualan',
                data: this.getMonthlyData(this.selectedYear).map((item) => item.sales),
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
          this.salesChart.data.datasets[0].data = this.getMonthlyData(this.selectedYear).map(
            (item) => item.sales,
          )
          this.salesChart.update()
        } catch (error) {
          console.error('Error updating chart:', error)
          this.chartError = true
          this.tryRenderChart()
        }
      },
      // New method for Excel export
      exportToExcel() {
        try {
          const wb = XLSX.utils.book_new()

          // Summary Data Worksheet
          const summaryData = [
            ['Laporan Penjualan'],
            ['Total Pendapatan', this.formatCurrency(this.reportData.Total_pendapatan)],
            ['Saldo Aktif', this.formatCurrency(this.reportData.Saldo_aktif)],
            ['Saldo Tercairkan', this.formatCurrency(this.reportData.Saldo_tercairkan)],
          ]
          const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
          XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan')

          // Sales Chart Data Worksheet
          const chartData = [
            ['Bulan', 'Penjualan (Rp)'],
            ...this.getMonthlyData(this.selectedYear).map((item) => [item.month, item.sales]),
          ]
          const wsChart = XLSX.utils.aoa_to_sheet(chartData)
          XLSX.utils.book_append_sheet(wb, wsChart, `Penjualan ${this.selectedYear}`)

          // Save the Excel file
          XLSX.writeFile(wb, `Laporan_Penjualan_${this.selectedYear}.xlsx`)
        } catch (error) {
          console.error('Error exporting to Excel:', error)
          alert('Gagal mengekspor ke Excel. Silakan coba lagi.')
        }
      },
      // New method for PDF export
      async exportToPDF() {
        try {
          const pdf = new jsPDF()
          const margin = 10
          let yPosition = 20

          // Add Title
          pdf.setFontSize(16)
          pdf.text('Laporan Penjualan', margin, yPosition)
          yPosition += 10

          // Add Summary Data
          pdf.setFontSize(12)
          pdf.text(
            `Total Pendapatan: ${this.formatCurrency(this.reportData.Total_pendapatan)}`,
            margin,
            yPosition,
          )
          yPosition += 10
          pdf.text(
            `Saldo Aktif: ${this.formatCurrency(this.reportData.Saldo_aktif)}`,
            margin,
            yPosition,
          )
          yPosition += 10
          pdf.text(
            `Saldo Tercairkan: ${this.formatCurrency(this.reportData.Saldo_tercairkan)}`,
            margin,
            yPosition,
          )
          yPosition += 20

          // Add Chart Title
          pdf.text(`Grafik Penjualan ${this.selectedYear}`, margin, yPosition)
          yPosition += 10

          // Capture the chart as an image
          const canvas = this.$refs.salesChart
          const chartImage = await html2canvas(canvas)
          const imgData = chartImage.toDataURL('image/png')
          const imgWidth = 190 // A4 width - margins
          const imgHeight = (chartImage.height * imgWidth) / chartImage.width
          pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight)

          // Save the PDF
          pdf.save(`Laporan_Penjualan_${this.selectedYear}.pdf`)
        } catch (error) {
          console.error('Error exporting to PDF:', error)
          alert('Gagal mengekspor ke PDF. Silakan coba lagi.')
        }
      },
    },
  }
  </script>
