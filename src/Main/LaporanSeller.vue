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
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

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
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(value)
    },

    async fetchReportData() {
      this.loading = true
      this.apiError = null
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No token found')
        }
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/seller/laporan`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.data.status !== 'success') {
          throw new Error(response.data.error || 'Failed to fetch report data')
        }
        this.reportData = response.data.data
        this.availableYears = Object.keys(this.reportData.grafik_penjualan).sort().reverse()
        this.selectedYear = this.availableYears[0] || new Date().getFullYear().toString()
      } catch (error) {
        console.error('Error fetching report data:', error.message)
        this.apiError = error.message
      } finally {
        this.loading = false
        await this.$nextTick()
        if (!this.apiError) {
          this.tryRenderChart()
        }
      }
    },

    async tryRenderChart() {
      this.chartError = false
      await this.$nextTick()
      if (!this.$refs.salesChart) {
        console.warn('Canvas not ready, retrying...')
        setTimeout(() => this.tryRenderChart(), 100)
        return
      }
      try {
        this.renderChart()
      } catch (error) {
        console.error('Error rendering chart:', error)
        this.chartError = true
      }
    },

    renderChart() {
      console.log('Attempting to render chart...')
      if (this.salesChart) {
        console.log('Destroying existing chart')
        this.salesChart.destroy()
        this.salesChart = null
      }
      if (!this.$refs.salesChart) {
        console.error('Chart canvas element not found')
        this.chartError = true
        return
      }
      if (!this.reportData.grafik_penjualan || !this.selectedYear) {
        console.error('Invalid chart data or selected year')
        this.chartError = true
        return
      }
      console.log('Canvas found, getting 2D context...')
      const ctx = this.$refs.salesChart.getContext('2d')
      if (!ctx) {
        console.error('Failed to get 2D context from canvas')
        this.chartError = true
        return
      }
      console.log('Rendering chart with data:', this.getMonthlyData(this.selectedYear))
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
            legend: { display: true, position: 'top' },
            tooltip: {
              callbacks: {
                label: (context) => 'Rp ' + context.parsed.y.toLocaleString('id-ID'),
              },
            },
          },
        },
      })
      console.log('Chart rendered successfully')
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

    async exportToPDF() {
      try {
        const pdf = new jsPDF('p', 'mm', 'a4')

        // === HEADER SECTION ===
        pdf.setFillColor(220, 53, 69)
        pdf.rect(0, 0, 210, 40, 'F')

        // Title
        pdf.setFontSize(22)
        pdf.setTextColor(255, 255, 255)
        pdf.setFont('helvetica', 'bold')
        pdf.text('LAPORAN PENJUALAN SELLER', 105, 18, { align: 'center' })

        // Subtitle
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text('Sistem Manajemen Samikados', 105, 28, { align: 'center' })
        pdf.text('Tanggal Export: ' + new Date().toLocaleDateString('id-ID'), 105, 35, {
          align: 'center',
        })

        // === RINGKASAN SECTION ===
        let yPos = 55

        pdf.setFillColor(248, 249, 250)
        pdf.rect(15, yPos - 5, 180, 10, 'F')
        pdf.setTextColor(220, 53, 69)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('RINGKASAN KEUANGAN', 20, yPos)

        yPos += 15

        // Summary data
        const summaryData = [
          { label: 'Total Pendapatan', value: this.reportData.Total_pendapatan },
          { label: 'Saldo Aktif', value: this.reportData.Saldo_aktif },
          { label: 'Saldo Tercairkan', value: this.reportData.Saldo_tercairkan },
          {
            label: 'Saldo Tersisa',
            value: this.reportData.Total_pendapatan - this.reportData.Saldo_tercairkan,
          },
        ]

        summaryData.forEach((item, index) => {
          const cardY = yPos + index * 15

          pdf.setFillColor(255, 255, 255)
          pdf.setDrawColor(220, 53, 69)
          pdf.setLineWidth(0.5)
          pdf.rect(20, cardY - 3, 170, 12, 'FD')

          pdf.setTextColor(52, 58, 64)
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`${item.label}:`, 25, cardY + 4)

          pdf.setTextColor(220, 53, 69)
          pdf.setFont('helvetica', 'bold')
          pdf.text(this.formatCurrency(item.value), 140, cardY + 4)
        })

        yPos += 80

        // === DETAIL PENJUALAN SECTION ===
        pdf.setFillColor(248, 249, 250)
        pdf.rect(15, yPos - 5, 180, 10, 'F')
        pdf.setTextColor(220, 53, 69)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`DETAIL PENJUALAN ${this.selectedYear}`, 20, yPos)

        yPos += 15

        // Table header
        pdf.setFillColor(220, 53, 69)
        pdf.rect(20, yPos - 5, 170, 10, 'F')

        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Bulan', 25, yPos)
        pdf.text('Penjualan', 85, yPos)
        pdf.text('Persentase', 145, yPos)

        yPos += 10

        // Table data
        const monthlyData = this.getMonthlyData(this.selectedYear)
        const totalPenjualanTahunan = monthlyData.reduce((total, item) => total + item.sales, 0)

        monthlyData.forEach((item, index) => {
          const rowY = yPos + index * 8

          if (index % 2 === 0) {
            pdf.setFillColor(248, 249, 250)
            pdf.rect(20, rowY - 2, 170, 8, 'F')
          }

          const persentase =
            totalPenjualanTahunan > 0 ? ((item.sales / totalPenjualanTahunan) * 100).toFixed(1) : 0

          pdf.setTextColor(52, 58, 64)
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'normal')
          pdf.text(item.month, 25, rowY + 3)
          pdf.text(this.formatCurrency(item.sales), 85, rowY + 3)

          // Progress bar
          const barWidth = (persentase / 100) * 30
          pdf.setFillColor(220, 53, 69, 0.3)
          pdf.rect(145, rowY, 30, 4, 'F')
          pdf.setFillColor(220, 53, 69)
          pdf.rect(145, rowY, barWidth, 4, 'F')

          pdf.setTextColor(52, 58, 64)
          pdf.text(persentase + '%', 180, rowY + 3)
        })

        yPos += monthlyData.length * 8 + 10

        // Total row
        pdf.setFillColor(220, 53, 69)
        pdf.rect(20, yPos - 2, 170, 10, 'F')

        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text('TOTAL', 25, yPos + 4)
        pdf.text(this.formatCurrency(totalPenjualanTahunan), 85, yPos + 4)
        pdf.text('100%', 180, yPos + 4)

        yPos += 20

        // === GRAFIK SECTION ===
        if (this.$refs.salesChart && !this.chartError && yPos < 200) {
          try {
            pdf.setFillColor(248, 249, 250)
            pdf.rect(15, yPos - 5, 180, 10, 'F')
            pdf.setTextColor(220, 53, 69)
            pdf.setFontSize(16)
            pdf.setFont('helvetica', 'bold')
            pdf.text(`GRAFIK PENJUALAN ${this.selectedYear}`, 20, yPos)

            yPos += 15

            const canvas = await html2canvas(this.$refs.salesChart, {
              backgroundColor: '#ffffff',
              scale: 2,
              logging: false,
              useCORS: true,
            })

            const imgData = canvas.toDataURL('image/png')
            const imgWidth = 170
            const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, 80)

            pdf.setDrawColor(220, 53, 69)
            pdf.setLineWidth(1)
            pdf.rect(20, yPos, imgWidth, imgHeight, 'S')
            pdf.addImage(imgData, 'PNG', 20, yPos, imgWidth, imgHeight)
            yPos += imgHeight + 10
          } catch (chartError) {
            console.warn('Could not add chart to PDF:', chartError)
            pdf.setTextColor(108, 117, 125)
            pdf.setFontSize(10)
            pdf.text('Grafik tidak dapat ditampilkan dalam PDF', 25, yPos)
            yPos += 10
          }
        }

        // === FOOTER SECTION ===
        const pageHeight = pdf.internal.pageSize.height
        const footerY = pageHeight - 25

        pdf.setFillColor(248, 249, 250)
        pdf.rect(0, footerY - 10, 210, 25, 'F')

        pdf.setTextColor(108, 117, 125)
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.text('Laporan ini dibuat secara otomatis oleh sistem Samikados', 105, footerY, {
          align: 'center',
        })
        pdf.text(
          'Dokumen ini bersifat rahasia dan hanya untuk penggunaan internal',
          105,
          footerY + 5,
          { align: 'center' },
        )
        pdf.text(
          '© ' + new Date().getFullYear() + ' Samikados. All rights reserved.',
          105,
          footerY + 10,
          { align: 'center' },
        )

        pdf.setTextColor(220, 53, 69)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Halaman 1', 190, footerY + 10)

        // Download PDF
        const fileName =
          'laporan-penjualan-seller-' + new Date().toISOString().split('T')[0] + '.pdf'
        pdf.save(fileName)

        console.log('PDF exported successfully')
      } catch (error) {
        console.error('Error exporting to PDF:', error)
        alert('Gagal mengekspor ke PDF. Silakan coba lagi atau hubungi administrator.')
      }
    },

    exportToExcel() {
      try {
        const wb = XLSX.utils.book_new()

        const data = [
          ['LAPORAN PENJUALAN SELLER'],
          ['Tanggal Export: ' + new Date().toLocaleDateString('id-ID')],
          [''],
          ['RINGKASAN KEUANGAN'],
          ['Kategori', 'Jumlah'],
          ['Total Pendapatan', this.formatCurrency(this.reportData.Total_pendapatan)],
          ['Saldo Aktif', this.formatCurrency(this.reportData.Saldo_aktif)],
          ['Saldo Tercairkan', this.formatCurrency(this.reportData.Saldo_tercairkan)],
          [
            'Saldo Tersisa',
            this.formatCurrency(
              this.reportData.Total_pendapatan - this.reportData.Saldo_tercairkan,
            ),
          ],
          [''],
          [`DETAIL PENJUALAN ${this.selectedYear}`],
          ['Bulan', 'Penjualan', 'Persentase'],
        ]

        const monthlyData = this.getMonthlyData(this.selectedYear)
        const totalPenjualanTahunan = monthlyData.reduce((total, item) => total + item.sales, 0)

        monthlyData.forEach((item) => {
          const persentase =
            totalPenjualanTahunan > 0 ? ((item.sales / totalPenjualanTahunan) * 100).toFixed(1) : 0
          data.push([item.month, this.formatCurrency(item.sales), persentase + '%'])
        })

        data.push(['TOTAL', this.formatCurrency(totalPenjualanTahunan), '100%'])

        const ws = XLSX.utils.aoa_to_sheet(data)
        ws['!cols'] = [{ width: 25 }, { width: 20 }, { width: 15 }]
        ws['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
        ]

        XLSX.utils.book_append_sheet(wb, ws, 'Laporan Penjualan')
        XLSX.writeFile(
          wb,
          'laporan-penjualan-seller-' + new Date().toISOString().split('T')[0] + '.xlsx',
        )
      } catch (error) {
        console.error('Error exporting to Excel:', error)
        alert('Gagal mengekspor ke Excel. Silakan coba lagi.')
      }
    },
  },
}
</script>
