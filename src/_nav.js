import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilDescription,
  cilPuzzle,
  cilSpeedometer,
  cilUser,
  cilLocationPin,
  cibElectron,
  cilCarAlt
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
        name: 'Cab Rates',
        to: '/base/cab-rates',
      },
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
        name: 'Drivers',
        to: '/base/drivers',
      },
      {
        component: CNavItem,
        name: 'Cabs',
        to: '/base/cabs',
      },
      {
        component: CNavItem,
        name: 'Feedbacks',
        to: '/base/feedbacks',
      },
      {
        component: CNavItem,
        name: 'Vehicle Types',
        to: '/base/vehicle-types',
      },
      {
        component: CNavItem,
        name: 'vehicles',
        to: '/base/vehicles'
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
        name: 'Blogs',
        to: '/base/blogs'
      },
      // Removed redundant single-view tabs (now subsumed by Data Explorer)
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
  // Extras removed to streamline UI
  {
    component: CNavItem,
    name: 'Vehicle Verification',
    icon: <CIcon icon={cilCarAlt} customClassName="nav-icon"/>,
    to: '/verification/vehicle-verif'
  },
  {
    component: CNavItem,
    name: 'Cab Verification',
    icon: <CIcon icon={cilCarAlt} customClassName="nav-icon"/>,
    to: '/verification/cab-verif'
  },
  {
    component: CNavItem,
    name: 'User Verification',
    icon: <CIcon icon={cilUser} customClassName="nav-icon"/>,
    to: '/verification/user-verif'
  },
  {
    component: CNavItem,
    name: 'Driver Verification',
    icon: <CIcon icon={cilUser} customClassName="nav-icon"/>,
    to: '/verification/driver-verif'
  },
]

export default _nav
