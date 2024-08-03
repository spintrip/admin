import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

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

//Verification
const UserVerification = React.lazy(() => import('./views/verification/user-verif/user-verif'))
const CarVerification = React.lazy(() => import('./views/verification/car-verif/car-verif'))
 

//Blog
const Blogs = React.lazy(() => import('./views/base/blogs/blogs'))

//Support
const Support = React.lazy(() => import('./views/base/support/support'))






// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))


// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/pages/login', name: 'Login', element: Login },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/theme/typography', name: 'Typography', element: Typography },
  { path: '/base/users', name: 'Users', element: Users },
  { path: '/base/hosts', name: 'Hosts', element: Hosts },
  { path: '/base/cars', name: 'Cars', element: Cars },
  { path: '/base/pricings', name: 'Pricings', element: Pricings },
  { path: '/base/bookings', name: 'Bookings', element: Bookings },
  { path: '/verification/car-verif', name: 'CarVerification', element: CarVerification },
  { path: '/verification/user-verif', name: 'UserVerification', element: UserVerification },
  { path: '/base/blogs', name: 'Blogs', element: Blogs },
  { path: '/base/features', name: 'Features', element: Features },
  { path: '/base/tax_data', name: 'Tax', element: Tax },
  { path: '/base/support', name: 'Support', element: Support },
  { path: '/base/brands', name: 'Brands', element: Brands },
  { path: '/forms/range', name: 'Range', element: Range },
  { path: '/icons', exact: true, name: 'Icons', element: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', element: Flags },
  { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
  { path: '/notifications/modals', name: 'Modals', element: Modals },
  { path: '/notifications/toasts', name: 'Toasts', element: Toasts },
  { path: '/widgets', name: 'Widgets', element: Widgets },
]

export default routes
