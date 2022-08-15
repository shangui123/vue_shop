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

                    <el-table :data="manyList" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 循环显示的tag -->
                                <el-tag v-for="(item, i) in  scope.row.attr_vals" :key="i" closable
                                    @close="closeItem(i, scope.row)"> {{ item }}
                                </el-tag>
                                <!-- 添加的tag输入框 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!-- 点击的按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index">
                        </el-table-column>
                        <el-table-column label="参数名称" prop="attr_name">
                        </el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" @click="showEditf(scope.row.attr_id)" size="mini"
                                    icon="el-icon-edit">修改
                                </el-button>
                                <el-button @click="deleteItem(scope.row.attr_id)" type="danger" size="mini"
                                    icon="el-icon-delete">删除</el-button>
                            </template>
                        </el-table-column>

                    </el-table>
                </el-tab-pane>

                <el-tab-pane :disabled="isBtnDisabled" label="静态属性" name="only">
                    <el-button type="primary" @click="addDialog = true" size="mini">添加属性</el-button>
                    <el-table :data="onlyList" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, i) in  scope.row.attr_vals" :key="i" closable
                                    @close="closeItem(i, scope.row)"> {{ item }}
                                </el-tag>
                                <!-- 添加的tag输入框 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!-- 点击的按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index">
                        </el-table-column>
                        <el-table-column label="参数名称" prop="attr_name">
                        </el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" @click="showEditf(scope.row.attr_id)" size="mini"
                                    icon="el-icon-edit">修改
                                </el-button>
                                <el-button type="danger" @click="deleteItem(scope.row.attr_id)" size="mini"
                                    icon="el-icon-delete">删除
                                </el-button>
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
            <el-form :model="editForm" ref="editformRef" :rules="editRuleF" label-width="70px">
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
            if (this.CateId.length !== 3) {
                this.CateId = []
                this.manyList = []
                this.onlyList = []
                return
            }
            //三级分类
            this.getParamsList()

        },

        async getParamsList() {
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
                params: { sel: this.activeName }
            })
            if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')

            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                item.inputVisible = false
                item.inputValue = ''
            })
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
            console.log(attr_id)
            this.showEdit = true
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
                params: { attr_sel: this.active }
            })
            if (res.meta.status !== 200) return this.$message.error('获取详情失败')
            this.showEdit = true
            this.editForm = res.data

        },

        // 通过id删除item
        async deleteItem(id) {
            console.log(id)
            const confirmRes = await this.$confirm('是否删除该属性？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err =>
                err
            )
            if (confirmRes === 'cancel') return this.$message.info('已取消删除')
            const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
            if (res.meta.status !== 200) return this.$message.error('删除失败')
            this.getParamsList()
            this.$message.success('删除成功')
        },

        //点击确定编辑 
        editParams() {
            this.$refs.editformRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status !== 200) return this.$message.error('修改失败')
                this.getParamsList()
                this.$message.success('修改成功')
                this.showEdit = false
            })
        },
        // 失焦或者按回车
        handleInputConfirm(row) {
            // 如果输入框的值去除空格为空 则关闭input 值为空
            if (row.inputValue.trim().length === 0) {
                row.inputVisible = false
                row.inputValue = ''
                return
            }
            // 不为空 进行后续操作
            row.attr_vals.push(row.inputValue.trim())
            row.inputVisible = false
            row.inputValue = ''
            this.changeTag(row)
        },

        // 改变tag值
        async changeTag(row) {
            const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals: row.attr_vals.join(' '),
            })
            if (res.meta.status !== 200) return this.$message.error('修改失败')
            this.$message.success('修改成功')
        },

        // 点击按钮
        showInput(row) {
            row.inputVisible = true
            // 自动获取input框的焦点
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        // 删除tag中的单项
        closeItem(i, row) {
            console.log(i, row)
            row.attr_vals.splice(i, 1)
            this.changeTag(row)
        }
    }
}
</script>

<style lang="less" scoped>
.cat-opt {
    margin: 15px 0;
}

.el-tag {
    margin: 5px;
}

.input-new-tag {
    width: 120px;
}
</style>