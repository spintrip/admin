import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilDescription,
  cilPuzzle,
  cilSpeedometer,
  cilSend,
  cilLocationPin,
  cibElectron,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { compose } from 'redux';

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
      // {
      //   component: CNavItem,
      //   name: 'Hosts',
      //   to: '/base/hosts',
      // },
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
      },
      {
        component: CNavItem,
        name: 'Transactions',
        to: '/base/transactions'
      }
    ],
  },
  
  {
    component: CNavGroup,
    name: 'Operations',
    icon: <CIcon icon={cibElectron} customClassName="nav-icon"/>,
    items: [
      {
        component: CNavItem,
        name: 'Notification',
        to: '/operations/notifications'
      },
      {
        component: CNavItem,
        name: 'Payout',
        to: '/operations/payout'
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Extras',
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
