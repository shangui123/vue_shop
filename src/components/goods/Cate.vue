<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <!--按钮 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-button type="primary" @click="showAdd">
                        添加分类
                    </el-button>
                </el-col>
            </el-row>
            <tree-table :data="cateList" class="treeTable" border :columns="columns" :selection-type="false"
                :expand-type="false" show-index index-text="#" :show-row-hover="false">

                <template slot="isok" slot-scope="scope">
                    <i v-if="scope.row.cat_deleted === false" style="color:lightgreen" class="el-icon-success"></i>
                    <i v-else style="color:red" class="el-icon-error"></i>
                </template>
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level === 1" size="mini" type="success">二级</el-tag>
                    <el-tag v-else type="warning" size="mini">三级</el-tag>
                </template>
                <template slot="opt" slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                </template>
            </tree-table>
            <el-pagination @size-change="sizeChange" @current-change="currentChange"
                :current-page.sync="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类 -->
        <el-dialog title="添加分类" :visible.sync="addDialog" width="50%" @close="addClose">
            <el-form :model="addForm" ref="addFormref" :rules="addRuleF" label-width="100px">
                <el-form-item label="活动名称：" prop="cat_name">
                    <el-input v-model="addForm.cat_name"></el-input>
                </el-form-item>

                <el-form-item label="父级分类：" prop="cat_pid">
                    <el-cascader expand-trigger="hover" clearable change-on-select v-model="parentCateId" :props="props"
                        :options="parentCateList" @change="parentCateChange"></el-cascader>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialog = false">取 消</el-button>
                <el-button type="primary" @click="addUsers">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template> 

<script>
export default {
    data() {
        return {
            cateList: [],//商品分类的列表
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            total: 0,
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    type: 'template',
                    template: 'isok'
                },
                {
                    label: '排序',
                    type: 'template',
                    template: 'order'
                }, {
                    label: '操作',
                    type: 'tem-plate',
                    template: 'opt'
                },
            ],
            addDialog: false,
            addForm:
            {
                cat_name: '',
                cat_pid: 0,
                cat_level: 0
            }
            ,
            addRuleF: {
                cat_name: [{
                    require: true, message: '请输入分类名称', trigger: 'blur'
                }]
            },
            parentCateList: [],
            parentCateId: [],
            props: {
                value: "cat_id",
                label: "cat_name",
                children: 'children'
            },
        }
    },
    mounted() {
        this.getCateList()
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
            console.log(res)
            if (res.meta.status !== 200) return this.$message.error('获取列表失败')
            this.total = res.data.total
            this.cateList = res.data.result
        },
        // 监听size事件
        sizeChange(newPage) {
            this.queryInfo.pagesize = newPage
            this.getCateList()
        },
        currentChange(current) {
            this.queryInfo.pagenum = current
            this.getCateList()
        },


        showAdd() {
            this.getParentCateList()
            this.addDialog = true
        },
        // 获取父级菜单
        async getParentCateList() {
            const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
            if (res.meta.status !== 200) return this.$message.error('父级列表获取失败')
            this.parentCateList = res.data
        },

        parentCateChange() {
            if (this.parentCateId.length > 0) {
                this.addForm.cat_pid = this.parentCateId[this.parentCateId.length - 1]
                this.addForm.cat_level = this.parentCateId.length
                return
            } else {
                this.addForm.cat_pid = 0
                this.addForm.cat_level = 0
            }
        },
        // 添加分类
        addUsers() {
            this.$refs.addFormref.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.post('categories', this.addForm)
                console.log(res)
                if (res.meta.status !== 201) return this.$message.error('添加分类失败')
                this.addClose()
                this.getCateList()
                this.$message.success('添加分类成功')

            })
        },
        addClose() {
            this.$refs.addFormref.resetFilelds()
            this.parentCateId = []
            this.addForm['cat_pid'] = 0
            this.addForm['cat_level'] = 0
            this.addDialog = false
        },
    }
}  
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 10px;
}

.el-cascader {
    width: 100%
}
</style>