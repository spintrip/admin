import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilDescription,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilLocationPin,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavTitle,
    name: 'Data Panel',
  },
  {
    component: CNavGroup,
    name: 'Data',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Users',
        to: '/base/users',
      },
      {
        component: CNavItem,
        name: 'Hosts',
        to: '/base/hosts',
      },
      {
        component: CNavItem,
        name: 'Cars',
        to: '/base/cars'
      },
      {
        component: CNavItem,
        name: 'Bookings',
        to: '/base/bookings'
      },
      {
        component: CNavItem,
        name: 'Pricing',
        to: '/base/pricings'
      },
      {
        component: CNavItem,
        name: 'Features',
        to: '/base/features'
      },
      {
        component: CNavItem,
        name: 'Tax',
        to: '/base/tax_data'
      },
      {
        component: CNavItem,
        name: 'Brands',
        to: '/base/brands'
      },
      {
        component: CNavItem,
        name: 'Messages',
        to: '/base/messages'
      }
    ],
  },
  
  {
    component: CNavTitle,
    name: 'Extras',
  },
  {
    component: CNavGroup,
    name: 'Pages',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Login',
        to: '/login',
      },
      {
        component: CNavItem,
        name: 'Register',
        to: '/register',
      },
      {
        component: CNavItem,
        name: 'Error 404',
        to: '/404',
      },
      {
        component: CNavItem,
        name: 'Error 500',
        to: '/500',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Blog',
    to:'/base/blogs',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Device',
    to: '/device',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Support',
    to:'/base/support',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Car Verification',
    to: '/verification/car-verif'
  },
  {
    component: CNavItem,
    name: 'User Verification',
    to: '/verification/user-verif'
  },
]

export default _nav
