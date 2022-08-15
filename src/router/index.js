import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './../components/login.vue'
import Home from './../components/home.vue'
import Welcome from './../components/welcome.vue'
import Users from '../components/user/users.vue'
import Commodity from './../components/commodity.vue'
import Menager from './../components/menager.vue'
import Order from './../components/order.vue'
import Statistics from './../components/statistics.vue'
import Rights from './../components/power/right.vue'
import Roles from './../components/power/roles.vue'
import Categories from './../components/goods/Cate.vue'
import Params from './../components/goods/params.vue'
import GoodList from './../components/goods/list.vue'
import GoodAdd from './../components/goods/add.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/login', component: Login
    }, {
      path: '/home', component: Home,
      redirect: '/welcome',
      children: [{
        path: "/welcome",
        component: Welcome
      }, {
        path: "/users",
        component: Users
      }, {
        path: "/commodity",
        component: Commodity

      }, {
        path: "/menager",
        component: Menager
      }, {
        path: "/order",
        component: Order
      }, {
        path: "/statistics",
        component: Statistics

      }, {
        path: "/rights",
        component: Rights
      }, {
        path: "/roles",
        component: Roles
      }, {
        path: "/categories",
        component: Categories
      }, {
        path: "/params",
        component: Params
      }, {
        path: "/goods",
        component: GoodList

      }, {
        path: "/goodAdd",
        component: GoodAdd
      }],


    }]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 获取token
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()

})

export default router
