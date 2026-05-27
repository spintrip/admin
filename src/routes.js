import { element } from 'prop-types'
import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

//Login
const Login = React.lazy(() => import('./views/pages/login/Login'))

// Base
const Users = React.lazy(() => import('./views/base/users/users'))
const Hosts = React.lazy(() => import('./views/base/hosts/hosts'))
const vehicles = React.lazy(() => import('./views/base/vehicles/vehicles'))
const Bookings = React.lazy(() => import('./views/base/bookings/bookings'))
const Pricings = React.lazy(() => import('./views/base/pricings/pricings'))
const Features = React.lazy(() => import('./views/base/features/features'))
const Tax = React.lazy(() => import('./views/base/tax_data/tax_data'))
const Brands = React.lazy(() => import('./views/base/brands/brands'))
const Messages = React.lazy(() => import('./views/base/messages/messages'))
const Transactions = React.lazy(() => import('./views/base/Transactions/transactions'))
const Drivers = React.lazy(() => import('./views/base/drivers/drivers'))
// At the top with other imports:
const DataExplorer = React.lazy(() => import('./views/base/crud/data-explorer/data-explorer'))
const Cabs = React.lazy(() => import('./views/base/cabs/cabs'))
const Feedbacks = React.lazy(() => import('./views/base/feedbacks/feedbacks'))
const VehicleTypes = React.lazy(() => import('./views/base/vehicle-types/vehicle-types'))
const CabRates = React.lazy(() => import('./views/base/cab-rates/CabRates'))
const SurgePricing = React.lazy(() => import('./views/base/surge-pricing/SurgePricing'))
const Subscriptions = React.lazy(() => import('./views/base/subscriptions/Subscriptions'))

//Verification
const UserVerification = React.lazy(() => import('./views/verification/user-verif/user-verif'))
const vehicleVerification = React.lazy(() => import('./views/verification/vehicle-verif/vehicle-verif'))
const DriverVerification = React.lazy(() => import('./views/verification/driver-verif/driver-verif'))
const CabVerification = React.lazy(() => import('./views/verification/cab-verif/cab-verif'))
 

//Blog
const Blogs = React.lazy(() => import('./views/base/blogs/blogs'))

//Support
const Support = React.lazy(() => import('./views/base/support/support'))

//Device
const Device = React.lazy(() => import('./views/device/device'))

//Notification
const Notifications = React.lazy(() => import('./views/operations/notifications/notifications'))
//Notification
const Payout = React.lazy(() => import('./views/operations/payout/payout'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/pages/login', name: 'Login', element: Login },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/base/users', name: 'Users', element: Users },
  { path: '/base/hosts', name: 'Hosts', element: Hosts },
  { path: '/base/vehicles', name: 'vehicles', element: vehicles },
  { path: '/base/pricings', name: 'Pricings', element: Pricings },
  { path: '/base/bookings', name: 'Bookings', element: Bookings },
  { path: '/base/self-drive-bookings', name: 'Self-Drive Bookings', element: Bookings },
  { path: '/base/cab-bookings', name: 'Cab Bookings', element: Bookings },

  { path: '/base/drivers', name: 'Drivers', element: Drivers },
  { path: '/base/cabs', name: 'Cabs', element: Cabs },
  { path: '/base/feedbacks', name: 'Feedbacks', element: Feedbacks },
  { path: '/base/vehicle-types', name: 'Vehicle Types', element: VehicleTypes },
  { path: '/base/cab-rates', name: 'Cab Rates', element: CabRates },
  { path: '/base/surge-pricing', name: 'Surge Pricing', element: SurgePricing },
  { path: '/base/subscriptions', name: 'Subscriptions', element: Subscriptions },
  { path: '/device', name: 'Device', element: Device },
  { path: '/verification/vehicle-verif', name: 'vehicleVerification', element: vehicleVerification },
  { path: '/verification/cab-verif', name: 'CabVerification', element: CabVerification },
  { path: '/verification/user-verif', name: 'UserVerification', element: UserVerification },
  { path: '/verification/driver-verif', name: 'DriverVerification', element: DriverVerification },
  { path: '/base/blogs', name: 'Blogs', element: Blogs },
  { path: '/base/features', name: 'Features', element: Features },
  { path: '/base/tax_data', name: 'Tax', element: Tax },
  { path: '/base/support', name: 'Support', element: Support },
  { path: '/base/brands', name: 'Brands', element: Brands },
  { path: '/base/messages', name: 'Messages', element: Messages },
  { path: '/base/transactions', name: 'Transactions', element: Transactions },
  { path: '/operations/notifications' , name: 'Notifications' , element: Notifications},
  { path: '/operations/payout' , name: 'Payout' , element: Payout},
  { path: '/admin/crud/:model', name: 'Data Explorer', element: DataExplorer },
]

export default routes;