<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>列表列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <el-table :data="rightList" border stripe>
                <el-table-column type="index"> </el-table-column>
                <el-table-column prop="authName" label="权限名称"> </el-table-column>
                <el-table-column prop="path" label="路径"> </el-table-column>
                <el-table-column   label="权限等级">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level === '0'">一级</el-tag>
                        <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
                        <el-tag v-else type="warning">三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>


<script>

export default {
    data() {
        return {
            rightList: [],
        }
    },
    mounted() {
        this.getRightsList()
    },
    methods: {
        // 获取权限列表
        async getRightsList() {
            const { data: res } = await this.$http.get('rights/list')
            console.log(res)
            if (res.meta.status !== 200) return this.$message.error('获取列表失败')
            this.$message.success('获取列表成功')
            this.rightList = res.data
        }
    }
}

</script>


<style lang="less" scoped>
</style>