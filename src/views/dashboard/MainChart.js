import React, { useEffect, useRef, useState } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import { getBooking } from '../../api/booking'

const MainChart = () => {
  const chartRef = useRef(null)
  const [bookingData, setBookingData] = useState([])

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookings = await getBooking()
        setBookingData(bookings || [])
      } catch (error) {
        console.error('Error fetching bookings for chart:', error)
      }
    }
    fetchBookings()
  }, [])

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    })
  }, [chartRef])

  const generateChartData = () => {
    const dates = []
    const counts = [0, 0, 0, 0, 0, 0, 0]
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      dates.push(d.toLocaleString('default', { month: 'long' }))
    }

    if (bookingData && bookingData.length > 0) {
      bookingData.forEach(booking => {
        const d = booking.createdAt ? new Date(booking.createdAt) : new Date(0)
        const monthDiff = (today.getFullYear() - d.getFullYear()) * 12 + today.getMonth() - d.getMonth()
        if (monthDiff >= 0 && monthDiff <= 6) {
          counts[6 - monthDiff] += 1
        }
      })
    }
    return { dates, counts }
  }

  const { dates, counts } = generateChartData()

  return (
    <>
      <CChartLine
        ref={chartRef}
        style={{ height: '300px', marginTop: '40px' }}
        data={{
          labels: dates,
          datasets: [
            {
              label: 'Total Bookings',
              backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
              borderColor: getStyle('--cui-info'),
              pointHoverBackgroundColor: getStyle('--cui-info'),
              borderWidth: 2,
              data: counts,
              fill: true,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                color: getStyle('--cui-border-color-translucent'),
                drawOnChartArea: false,
              },
              ticks: {
                color: getStyle('--cui-body-color'),
              },
            },
            y: {
              beginAtZero: true,
              border: {
                color: getStyle('--cui-border-color-translucent'),
              },
              grid: {
                color: getStyle('--cui-border-color-translucent'),
              },
              ticks: {
                color: getStyle('--cui-body-color'),
                maxTicksLimit: 5,
              },
            },
          },
          elements: {
            line: {
              tension: 0.4,
            },
            point: {
              radius: 0,
              hitRadius: 10,
              hoverRadius: 4,
              hoverBorderWidth: 3,
            },
          },
        }}
      />
    </>
  )
}

export default MainChart
