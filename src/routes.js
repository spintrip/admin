import { element } from 'prop-types'
import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

//Login
const Login = React.lazy(() => import('./views/pages/login/Login'))

// Base
const Users = React.lazy(() => import('./views/base/users/users'))
const Hosts = React.lazy(() => import('./views/base/hosts/hosts'))
const Cars = React.lazy(() => import('./views/base/cars/cars'))
const Bookings = React.lazy(() => import('./views/base/bookings/bookings'))
const Pricings = React.lazy(() => import('./views/base/pricings/pricings'))
const Features = React.lazy(() => import('./views/base/features/features'))
const Tax = React.lazy(() => import('./views/base/tax_data/tax_data'))
const Brands = React.lazy(() => import('./views/base/brands/brands'))
const Messages = React.lazy(() => import('./views/base/messages/messages'))
const Transactions = React.lazy(() => import('./views/base/Transactions/transactions'))

//Verification
const UserVerification = React.lazy(() => import('./views/verification/user-verif/user-verif'))
const CarVerification = React.lazy(() => import('./views/verification/car-verif/car-verif'))
 

//Blog
const Blogs = React.lazy(() => import('./views/base/blogs/blogs'))

//Support
const Support = React.lazy(() => import('./views/base/support/support'))

//Device
const Device = React.lazy(() => import('./views/device/device'))

//Notification
const Notifications = React.lazy(() => import('./views/operations/notifications/notifications'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/pages/login', name: 'Login', element: Login },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/base/users', name: 'Users', element: Users },
  { path: '/base/hosts', name: 'Hosts', element: Hosts },
  { path: '/base/cars', name: 'Cars', element: Cars },
  { path: '/base/pricings', name: 'Pricings', element: Pricings },
  { path: '/base/bookings', name: 'Bookings', element: Bookings },
  { path: '/device', name: 'Device', element: Device },
  { path: '/verification/car-verif', name: 'CarVerification', element: CarVerification },
  { path: '/verification/user-verif', name: 'UserVerification', element: UserVerification },
  { path: '/base/blogs', name: 'Blogs', element: Blogs },
  { path: '/base/features', name: 'Features', element: Features },
  { path: '/base/tax_data', name: 'Tax', element: Tax },
  { path: '/base/support', name: 'Support', element: Support },
  { path: '/base/brands', name: 'Brands', element: Brands },
  { path: '/base/messages', name: 'Messages', element: Messages },
  { path: '/base/transactions', name: 'Transactions', element: Transactions },
  { path: '/operations/notifications' , name: 'Notifications' , element: Notifications},
]

export default routes;