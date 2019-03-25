import CustomMain from '@/components/custom-main'

export default [
  {
    path: '/',
    name: 'home',
    redirect: '/member/index',
    component: CustomMain,
    children: [
      {
        path: '/member/index',
        name: 'member_index',
        meta: {
          activedMenuTitle: '会员管理'
        },
        component: () => import('@/views/member/index')
      },
      {
        path: '/vip_number/index',
        name: 'vip_number_index',
        meta: {
          activedMenuTitle: '编号管理'
        },
        component: () => import('@/views/vip_number/index')
      },
      {
        path: '/order/index',
        name: 'order_index',
        meta: {
          activedMenuTitle: '订单管理'
        },
        component: () => import('@/views/order/index')
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login')
  },
  {
    path: '*',
    name: 'error_404',
    component: () => import('@/views/error_page/404')
  }
];
