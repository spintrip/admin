import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// routes config
import routes from '../routes'

const AppContent = () => {
  const roleRaw = localStorage.getItem('adminRole') || 'SUPER_ADMIN';
  const role = roleRaw ? roleRaw.toUpperCase() : 'SUPER_ADMIN';

  const cabAdminAllowedNames = [
    'Home', 'Login', 'Dashboard', 
    'Cabs', 'Drivers', 'Pricings', 'Bookings', 'Cab Rates'
  ];

  const filteredRoutes = (role === 'SUPER_ADMIN' || role === 'SUPERADMIN' || role === 'ADMIN')
    ? routes 
    : routes.filter(route => cabAdminAllowedNames.includes(route.name));

  return (
    <div className="" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {filteredRoutes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={<route.element />}
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default React.memo(AppContent)
