import React, { useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
  CButton,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons';
import { fetchUsers } from '../../api/user';
import { getBooking } from '../../api/booking';
import { fetchDrivers } from '../../api/driver';
import { getTransaction } from '../../api/transaction';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';

const WidgetsDropdown = (props) => {
  const widgetChartRef1 = useRef(null);
  const widgetChartRef2 = useRef(null);
  const [timePeriod, setTimePeriod] = useState('week');

  const [userData, setUserData] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [driverData, setDriverData] = useState([]);
  const [transactionData, setTransactionData] = useState([]);

  const fetchData = async () => {
    try {
      const [users, bookings, drivers, transactions] = await Promise.all([
        fetchUsers(),
        getBooking(),
        fetchDrivers(),
        getTransaction()
      ]);
      setUserData(users || []);
      setBookingData(bookings || []);
      setDriverData(drivers || []);
      setTransactionData(transactions || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
          widgetChartRef1.current.update()
        })
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef2.current.update()
        })
      }
    })
  }, [widgetChartRef1, widgetChartRef2]);

  const FormatTotal = (total) => {
    return total >= 1000 ? (total / 1000).toFixed(1) + 'k' : total;
  };

  const calculateMetrics = (dataArray, isSum = false, valueField = 'amount') => {
    if (!dataArray || dataArray.length === 0) {
      return { current: 0, percentage: '0%', increase: true };
    }

    let sortedData = [...dataArray].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    let currentStart, currentEnd, differenceFunction;
    if (timePeriod === 'week') {
      currentStart = startOfWeek(new Date());
      currentEnd = endOfWeek(new Date());
      differenceFunction = differenceInWeeks;
    } else if (timePeriod === 'month') {
      currentStart = startOfMonth(new Date());
      currentEnd = endOfMonth(new Date());
      differenceFunction = differenceInMonths;
    } else {
      currentStart = startOfYear(new Date());
      currentEnd = endOfYear(new Date());
      differenceFunction = differenceInYears;
    }

    const currentPeriodData = sortedData.filter((item) => {
      const itemDate = item.createdAt ? new Date(item.createdAt) : new Date(0);
      return itemDate >= currentStart && itemDate <= currentEnd;
    });

    let currentVal = 0;
    if (isSum) {
      currentVal = currentPeriodData.reduce((acc, curr) => acc + (Number(curr[valueField]) || 0), 0);
    } else {
      currentVal = currentPeriodData.length;
    }

    const previousData = sortedData.filter((item) => {
      const itemDate = item.createdAt ? new Date(item.createdAt) : new Date(0);
      return itemDate < currentStart;
    });

    let previousValTotal = 0;
    if (isSum) {
      previousValTotal = previousData.reduce((acc, curr) => acc + (Number(curr[valueField]) || 0), 0);
    } else {
      previousValTotal = previousData.length;
    }

    const numberOfPreviousPeriods = previousData.length > 0 
      ? differenceFunction(new Date(), previousData[previousData.length - 1]?.createdAt ? new Date(previousData[previousData.length - 1].createdAt) : new Date())
      : 0;
      
    const avgPrev = numberOfPreviousPeriods > 0 ? (previousValTotal / numberOfPreviousPeriods) : 0;

    let percentageDifference = '0.0%';
    if (avgPrev === 0) {
      percentageDifference = currentVal > 0 ? '100.0%' : '0.0%';
    } else {
      percentageDifference = (((currentVal - avgPrev) / avgPrev) * 100).toFixed(1) + '%';
    }

    return {
      current: currentVal,
      percentage: percentageDifference,
      increase: currentVal >= avgPrev
    };
  };

  const roleRaw = localStorage.getItem('adminRole') || 'SUPER_ADMIN';
  const role = roleRaw.toUpperCase();

  const userMetrics = calculateMetrics(userData);
  const bookingMetrics = calculateMetrics(bookingData);
  const driverMetrics = calculateMetrics(driverData);
  const transactionMetrics = calculateMetrics(transactionData, true, 'amount'); // Assuming 'amount' is the field

  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      {(role === 'SUPER_ADMIN' || role === 'SUPERADMIN' || role === 'ADMIN') && (
      <CCol sm={6} xl={4} xxl={3}>
        <div className="d-flex justify-content-end mb-2 gap-2">
          <CButton color={timePeriod === 'week' ? 'primary' : 'secondary'} variant={timePeriod === 'week' ? '' : 'outline'} size="sm" onClick={() => setTimePeriod('week')}>Week</CButton>
          <CButton color={timePeriod === 'month' ? 'primary' : 'secondary'} variant={timePeriod === 'month' ? '' : 'outline'} size="sm" onClick={() => setTimePeriod('month')}>Month</CButton>
          <CButton color={timePeriod === 'year' ? 'primary' : 'secondary'} variant={timePeriod === 'year' ? '' : 'outline'} size="sm" onClick={() => setTimePeriod('year')}>Year</CButton>
        </div>
        <CWidgetStatsA
          className="mb-4 pb-0 widgets-dropdown"
          color="primary"
          value={
            <>
              {FormatTotal(userMetrics.current)}{' '}
              <span className="fs-6 fw-normal">
                {userMetrics.increase ? '+' : ''}{userMetrics.percentage} <CIcon icon={userMetrics.increase ? cilArrowTop : cilArrowBottom} />
              </span>
            </>
          }
          title="Users"
          chart={
            <CChartLine
              ref={widgetChartRef1}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-primary'),
                    data: [0,0,0,50,0],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    min: 30,
                    max: 89,
                    display: false,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
                elements: {
                  line: {
                    borderWidth: 1,
                    tension: 0.4,
                  },
                  point: {
                    radius: 4,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      )}
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="info"
          value={
            <>
              {FormatTotal(bookingMetrics.current)}{' '}
              <span className="fs-6 fw-normal">
                ({bookingMetrics.increase ? '+' : ''}{bookingMetrics.percentage} <CIcon icon={bookingMetrics.increase ? cilArrowTop : cilArrowBottom} />)
              </span>
            </>
          }
          title="Active Bookings"
          chart={
            <CChartLine
              ref={widgetChartRef2}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: [1, 18, 9, 17, 34, 22, 11],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    min: -9,
                    max: 39,
                    display: false,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
                elements: {
                  line: {
                    borderWidth: 1,
                  },
                  point: {
                    radius: 4,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="warning"
          value={
            <>
              {FormatTotal(driverMetrics.current)}{' '}
              <span className="fs-6 fw-normal">
                ({driverMetrics.increase ? '+' : ''}{driverMetrics.percentage} <CIcon icon={driverMetrics.increase ? cilArrowTop : cilArrowBottom} />)
              </span>
            </>
          }
          title="Available Drivers"
          chart={
            <CChartLine
              className="mt-3"
              style={{ height: '70px' }}
              data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [78, 81, 80, 45, 34, 12, 40],
                    fill: true,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    display: false,
                  },
                  y: {
                    display: false,
                  },
                },
                elements: {
                  line: {
                    borderWidth: 2,
                    tension: 0.4,
                  },
                  point: {
                    radius: 0,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="danger"
          value={
            <>
              Rs. {FormatTotal(transactionMetrics.current)}{' '}
              <span className="fs-6 fw-normal">
                ({transactionMetrics.increase ? '+' : ''}{transactionMetrics.percentage} <CIcon icon={transactionMetrics.increase ? cilArrowTop : cilArrowBottom} />)
              </span>
            </>
          }
          title="Total Income"
          chart={
            <CChartBar
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: [
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                  'January',
                  'February',
                  'March',
                  'April',
                ],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
                    barPercentage: 0.6,
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
                      display: false,
                      drawTicks: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                      drawTicks: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
              }}
            />
          }
        />
      </CCol>
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default WidgetsDropdown
