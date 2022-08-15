<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input clearable @clear="getGoodsList" v-model="queryInfo.query" placeholder="请输入内容">
                        <el-button slot="append" @click="getGoodsList" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button @click="add" type="primary">添加商品</el-button>
                </el-col>
            </el-row>
        </el-card>

        <el-table :data="goodsList" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="goods_name" label="商品名称"></el-table-column>
            <el-table-column prop="goods_price" width="95px" label="商品价格（元）"></el-table-column>
            <el-table-column prop="goods_weight" width="75px" label="商品重量"></el-table-column>
            <el-table-column width="140px" label="创建时间">
                <template slot-scope="scope">
                    {{ scope.row.add_time | dataFormat }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="130px">
                <template slot-scope="scope">
                    <el-button size="mini" icon="el-icon-edit" type="primary" @click='editItem(scope.row)'>
                    </el-button>
                    <el-button size="mini" icon="el-icon-delete" type="danger" @click='deleteItem(scope.row.goods_id)'>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页区域 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page.sync="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper" :total="total" background>
        </el-pagination>

    </div>
</template>

<script>

export default {
    data() {
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10,
            },
            pagenum: 0,
            total: 0,
            goodsList: [],
        }
    },
    created() {
        this.getGoodsList()
    },
    methods: {
        async getGoodsList() {
            const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error('获取列表失败')
            this.goodsList = res.data.goods
            this.pagenum = res.data.pagenum
            this.total = res.data.total

        },

        handleSizeChange(size) {
            this.queryInfo.pagesize = size
            this.getGoodsList()
        },
        handleCurrentChange(num) {
            this.queryInfo.pagenum = num
            this.getGoodsList()
        },
        async deleteItem(id) {
            const confirmRes = await this.$confirm('是否删除该商品？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if (confirmRes !== 'confirm') return this.$message.info('取消删除')
            const { data: res } = await this.$http.delete(`goods/${id}`)

            if (res.meta.status !== 200) return this.$message.error('删除失败')
            this.getGoodsList()
            this.$message.success('删除成功')
        },
        add() {
            this.$router.push('goodAdd')
        }

    }
}
</script>

<style lang="less" scoped>
</style>