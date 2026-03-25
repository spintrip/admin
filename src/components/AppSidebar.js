import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CImage,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'
import { jwtDecode } from 'jwt-decode'

import logo from 'src/assets/brand/Spintrip_logo.png'
import { sygnet } from 'src/assets/brand/sygnet'

// sidebar nav config
import navigation from '../_nav'

const filterNavItemsByRole = (navItems, roleRaw) => {
  const role = roleRaw ? roleRaw.toUpperCase() : 'SUPER_ADMIN';
  if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN' || role === 'ADMIN') return navItems;

  const cabAdminAllowedNames = [
    'Dashboard', 'Data Panel', 'Data', 
    'Cabs', 'Drivers', 'Bookings', 'Cab Rates'
  ];

  const filterRecursive = (items) => {
    return items.map(item => {
      if (item.items) {
        return { ...item, items: filterRecursive(item.items) };
      }
      return item;
    }).filter(item => {
      if (item.name && cabAdminAllowedNames.includes(item.name)) return true;
      return false;
    }).filter(item => {
      if (item.items && item.items.length === 0) return false;
      return true;
    });
  }

  return filterRecursive(navItems);
}

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  
  const role = localStorage.getItem('adminRole') || 'SUPER_ADMIN';
  const filteredNav = React.useMemo(() => filterNavItemsByRole(navigation, role), [role]);

  React.useEffect(() => {
    if (role === 'admin') {
      try {
        const token = localStorage.getItem('adminToken');
        if (token) {
          const decoded = jwtDecode(token);
          if (decoded.adminRole && decoded.adminRole !== role) {
            localStorage.setItem('adminRole', decoded.adminRole);
            window.location.reload();
          }
        }
      } catch (err) {}
    }
  }, [role]);

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          <CImage src={logo} customclassname="sidebar-brand-full" height={40} />
          {/* <CIcon customclassname="sidebar-brand-narrow" icon={sygnet} height={32} /> */}
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={filteredNav} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
