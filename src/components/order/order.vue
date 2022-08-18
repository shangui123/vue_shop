<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input v-model="queryInfo.query" placeholder="请输入订单名称">
                        <el-button @click="getOrderList" slot="append" icon="el-icon-search">
                        </el-button>
                    </el-input>
                </el-col>
            </el-row>

            <el-table :data="orderList" border strike>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="order_number" label=""></el-table-column>
                <el-table-column prop="order_price" label="订单价格(元)"></el-table-column>
                <el-table-column label="是否付款">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.pay_status === '0'" type="danger"> 未付款</el-tag>
                        <el-tag v-else type="primary"> 已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货">
                </el-table-column>
                <el-table-column label="下单时间">
                    <template slot-scope="scope">{{ scope.row.create_time | dataFormat }}</template>
                </el-table-column>


                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button @click="addressDialog = true" size="mini" type="primary" icon="el-icon-edit">
                        </el-button>
                        <el-button @click="showProgress" size="mini" type="success" icon="el-icon-location">
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 分页区域 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page.sync="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper" :total="total" background>
        </el-pagination>
        <!-- 修改地址-->
        <el-dialog title="修改" :visible.sync="addressDialog" width="50%" @close="addClose">
            <el-form :model="addressForm" ref="addressFormref" :rules="addressRuleF" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader expand-trigger="hover" clearable change-on-select v-model="addressForm.address1"
                        :options="cityList" @change="cityChange"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressDialog = false">取 消</el-button>
                <el-button type="primary" @click="addressOrder">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 物流列表-->
        <el-dialog title="物流列表" :visible.sync="progressDialog" width="50%" @close="progressClose">

            <el-timeline>
                <el-timeline-item v-for="(activity, index) in progressList" :key="index" :timestamp="activity.time">
                    {{ activity.context }}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
import cityList from './citydata'
export default {
    data() {
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10,
            },
            orderList: [],
            total: 0,
            cityList,
            addressDialog: false,
            addressForm: {
                address1: [],
                address2: ''
            },
            addressRuleF: {
                address1: [{ required: true, message: '请选择地址', trigger: 'blur' },
                ],
                address2: [{ required: true, message: '请填入详细地址', trigger: 'blur' },
                ]
            },
            progressList: [],
            progressDialog: false,
        }
    },
    created() { this.getOrderList() },
    methods: {
        async getOrderList() {
            const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error('获取列表失败')
            this.orderList = res.data.goods
            this.total = res.data.total
        },
        handleSizeChange(size) {
            this.queryInfo.pagesize = size
            this.getOrderList()
        },
        handleCurrentChange(num) {
            this.queryInfo.pagenum = num
            this.getOrderList()
        },

        addClose() {
            this.$refs.addressFormref.resetFields()
        },
        cityChange() {
            console.log(this.addressForm.address1)
        },
        addressOrder() { },

        async showProgress() {
            const { data: res } = await this.$http.get('/kuaidi/1106975712662')
            if (res.meta.status !== 200) return this.$message.error('获取物流信息失败')
            this.progressList = res.data
            this.progressDialog = true
            console.log(res)
        },

        progressClose() {
            this.progressDialog = false
        },
    }
}
</script>

<style lang="less" scoped>
</style>