<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closeable="false">

            </el-alert>
            <el-row class="cat-opt" :gutter="20">
                <el-col :span="8">
                    <span>选择商品分类：</span>
                    <el-cascader expand-trigger="hover" clearable change-on-select v-model="CateId" :props="props"
                        :options="cateList" @change="CateChange"></el-cascader>
                </el-col>
            </el-row>

            <el-tabs v-model="activeName" @tab-click="handleTab">
                <el-tab-pane :disabled="isBtnDisabled" label="动态参数" name="many">
                    <el-button type="primary" @click="addDialog = true" size="mini">添加参数</el-button>

                    <el-table :data="manyList" border strike>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                {{ scope.row.attr_vals }}
                            </template>
                        </el-table-column>
                        <el-table-column type="index">
                        </el-table-column>
                        <el-table-column label="参数名称" prop="attr_name">
                        </el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" @click="showEditf(scope.row.id)" size="mini"
                                    icon="el-icon-edit">修改
                                </el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>

                            </template>
                        </el-table-column>

                    </el-table>
                </el-tab-pane>

                <el-tab-pane :disabled="isBtnDisabled" label="静态属性" name="only">
                    <el-button type="primary" @click="addDialog = true" size="mini">添加属性</el-button>
                    <el-table :data="onlyList" border strike>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                {{ scope.row.attr_vals }}
                            </template>
                        </el-table-column>
                        <el-table-column type="index">
                        </el-table-column>
                        <el-table-column label="参数名称" prop="attr_name">
                        </el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" @click="showEditf(scope.row.id)" size="mini"
                                    icon="el-icon-edit">修改
                                </el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- //添加参数的弹窗 -->
        <el-dialog :title="'添加' + titleText" :visible.sync="addDialog" width="50%" @close="addClose">
            <el-form :model="addForm" ref="addFormref" :rules="addRuleF" label-width="70px">
                <el-form-item label="用户名" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialog = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>
        <!-- //修改参数的弹窗 -->
        <el-dialog :title="'修改' + titleText" :visible.sync="showEdit" width="50%" @close="editClose">
            <el-form :model="editForm" ref="editFormref" :rules="editRuleF" label-width="70px">
                <el-form-item label="用户名" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showEdit = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>

export default {
    computed: {
        isBtnDisabled() {
            if (this.CateId.length !== 3) {
                return true
            } else {
                return false
            }
        },
        cateId() {
            if (this.CateId.length === 3) {
                return this.CateId[2]
            } else {
                return null
            }
        },
        //动态弹窗面板
        titleText() {
            if (this.activeName === 'many') {
                return '动态参数'
            } else {
                return '静态属性'
            }
        }
    },
    data() {
        return {
            cateList: [],
            CateId: [],
            manyList: [],//动态参数
            onlyList: [],//静态数据
            props: {
                value: "cat_id",
                label: "cat_name",
                children: 'children'
            },
            activeName: 'many',
            addDialog: false,
            addForm: {
                attr_name: ''
            },
            addRuleF: {
                attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' },
                ]
            },
            showEdit: false,
            editForm: {
            },
            editRuleF: {
                attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' },
                ]
            },
        }
    },
    mounted() {
        this.getCateList()
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
            this.cateList = res.data
        },
        CateChange() {
            if (this.CateId.length !== 3) return this.CateId = []
            //三级分类
            this.getParamsList()
        },

        async getParamsList() {
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
                params: { sel: this.activeName }
            })
            if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')

            if (this.activeName === 'many') {
                this.manyList = res.data
            } else {
                this.onlyList = res.data
            }
        },
        handleTab() {
            this.getParamsList()
        },

        //关闭静态属性的弹窗
        addClose() {
            this.$refs.addFormref.resetFields()
        },


        // 添加参数
        addParams() {
            this.$refs.addFormref.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })

                if (res.meta.status !== 201) return this.$message.error('添加参数失败')
                this.$message.success('添加参数成功')
                this.addDialog = false
                this.getParamsList()
            })
        },

        //关闭编辑弹窗
        editClose() {
            this.$refs.editformRef.resetFields()
        },

        //获取属性详情 接口失败
        async showEditf(attr_id) {
            this.showEdit = true
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes${attr_id}`, {
                params: { attr_sel: this.active }
            })
            if (res.meta.status !== 200) return this.$message.error('获取详情失败')
            this.showEdit = true
            this.editForm = res.data

        },

        //点击确定编辑 
        editParams() {
            this.$refs.editformRef.validate(async valid => {
                if (!valid) return
                // const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes`, {
                //     attr_name: this.addForm.attr_name,
                //     attr_sel: this.activeName
                // })
            })
        },
    }
}
</script>

<style lang="less" scoped>
.cat-opt {
    margin: 15px 0;
}
</style>