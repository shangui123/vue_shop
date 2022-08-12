<template>
    <el-container>
        <!-- 头部 -->
        <el-header>
            <div>
                <img src="./../assets/logo.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button @click="loginOut" type="info">退出</el-button>
        </el-header>
        <el-container>
            <!-- 左侧 -->
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <div class="toggle-button" @click="toggleC">|||</div>
                <el-menu default-active="2" class="el-menu-vertical-demo" background-color="#333744" text-color="#fff"
                    active-text-color="#409eff" router unique-opened :collapse="isCollapse" :collapse-transition="false"
                    :default-active="activePath">
                    <!-- 一级菜单 -->
                    <el-submenu v-for="item in menuList" :key="item.id" :index="item.id + ''">
                        <!-- 一级菜单的模板区 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i class="el-icon-location"></i>
                            <!-- 文本 -->
                            <span>{{ item.authName }}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item v-for="itemItem in item.children" :key="itemItem.id" :index="'' + itemItem.path
                        " @click="saveNav(itemItem.path)">
                            <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 文本 -->
                                <span>{{ itemItem.authName }}</span>
                            </template>
                        </el-menu-item>

                    </el-submenu>

                </el-menu>
            </el-aside>
            <!-- 主要位置 -->
            <el-main>
                <!-- 路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>

</template>
<script>
export default {
    data() {
        return {
            menuList: [],
            isCollapse: false,
            activePath: ''
        }
    },

    created() {
        this.getMenuList()
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
        loginOut() {
            window.sessionStorage.clear()
            this.$router.push('/login')
        },
        async getMenuList() {
            const { data: res } = await this.$http.get('menus')

            if (res.meta.status !== 200) return this.$message.error('获取失败')
            this.menuList = res.data

        },
        toggleC() {
            this.isCollapse = !this.isCollapse
        },
        // 保存链接的激活状态
        saveNav(e) {
            window.sessionStorage.setItem('activePath', e)
            this.activePath = e
        }


    }
}
</script>


<style lang="less" scoped>
.el-container {
    height: 100%;
}

.el-header {
    background-color: #373d31;
    display: flex;
    justify-content: space-between;
    padding: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;

    >div {
        display: flex;
        align-items: center;

        img {
            height: 60px;
            width: 60px;
        }

        span {
            margin-left: 15px;
        }
    }



}

.el-aside {
    background-color: #333744;

    .el-menu {
        border: 0;
    }

}

.el-main {
    background-color: #eaedf1;

}

.toggle-button {
    background-color: #4a5064;
    font-size: 20px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
</style>