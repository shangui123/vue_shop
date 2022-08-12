<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 搜索与添加区 -->

            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input clearable @clear="clear" v-model="queryInfo.query" placeholder="请输入内容">
                        <el-button @click="serach" slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogF">添加该用户</el-button>
                </el-col>
            </el-row>
        </el-card>
        <!-- 用户列表区域 -->

        <el-table :data="userList" border stripe>
            <el-table-column type="index">
            </el-table-column>
            <el-table-column prop="username" label="姓名">
            </el-table-column>
            <el-table-column prop="email" label="邮箱">
            </el-table-column>

            <el-table-column prop="mobile" label="电话">
            </el-table-column>
            <el-table-column prop="role_name" label="角色">
            </el-table-column>
            <el-table-column label="状态">
                <template slot-scope="scope">
                    <el-switch @change="changeState(scope.row)" v-model="scope.row.mg_state">
                    </el-switch>
                </template>

            </el-table-column>
            <el-table-column label="操作" widtg="180px">
                <template slot-scope="scope">
                    <el-button size="mini" @click="editDialogF(scope.row.id)" type="primary" icon="el-icon-edit">
                    </el-button>
                    <el-button size="mini" @click="removeUser(scope.row.id)" type="danger" icon="el-icon-delete">
                    </el-button>
                    <el-tooltip :entterable="false" effect="dark" content="分配角色" placement="top-start">
                        <el-button size="mini" @click="setRole(scope.row)" type="warning" icon="el-icon-setting">
                        </el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页区域 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page.sync="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>

        <!-- 添加用户的弹框 -->
        <el-dialog title="添加用户" :visible.sync="addDialog" width="50%" @close="addClose">
            <el-form :model="addForm" ref="addFormref" :rules="addRuleF" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>

                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>

                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>

                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialog = false">取 消</el-button>
                <el-button type="primary" @click="addUsers">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 删除用户的弹框 -->
        <el-dialog title="编辑用户" :visible.sync="editDialog" width="50%" @close="editClose">
            <el-form :model="editForm" ref="editFormref" :rules="editRuleF" label-width="70px">
                <el-form-item label="用户名">
                    <el-input disabled v-model="editForm.username"></el-input>
                </el-form-item>

                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>

                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialog = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="分配角色" :visible.sync="setUserDialog" width="50%" @close="setUserClose">
            <div>
                <p>当前的用户：{{ userInfo.username }}</p>
                <p>当前的角色：{{ userInfo.role_name }}</p>
                <p>当前的角色： <el-select v-model="selectRoleId" placeholder="请选择">
                        <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id">
                        </el-option>
                    </el-select>
                </p>

            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialog = false">取 消</el-button>
                <el-button @click="allotUsers" type="primary">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>


export default {
    data() {
        // 验证邮箱的规则

        var checkEmail = (rule, value, cb) => {
            // 邮箱正则表达是
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if (regEmail.test(value)) {
                return cb()
            }
            cb(new Error('请提供合法的邮箱'))
        }
        // 验证手机的规则
        var checkPhone = (rule, value, cb) => {
            // 邮箱正则表达是
            const regPhone = /^1[3456789]\d{9}$/
            if (regPhone.test(value)) {
                return cb()
            }
            cb(new Error('请提供合法的手机号'))
        }
        return {
            queryInfo: {
                // 搜索值
                query: '',
                // 当前的页数
                pagenum: 1,
                // 当前每次显示多少条数据
                pagesize: 5
            },
            userList: [],
            pagenum: 0,
            total: 0,
            addDialog: false,//控制添加弹框
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: '',
            },


            addRuleF: {
                username: [{ required: true, message: '请输入用户名', trigger: 'blur' },
                { min: 3, max: 10, message: '用户名的长度控制在3-10个字之间', trigger: 'blur' },
                ],
                password: [{ required: true, message: '请输入密码', trigger: 'blur' },
                { min: 6, max: 10, message: '用户名的长度控制在6-10个字之间', trigger: 'blur' },
                ],
                email: [{ required: true, message: '请输入邮箱', trigger: 'blur' },
                { validator: checkEmail, trigger: 'blur' },
                ],
                mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' },
                { validator: checkPhone, trigger: 'blur' }]
            },
            editDialog: false,//控制删除弹框

            editForm: {},//查询到的用户信息

            editRuleF: {
                username: [{ required: true, message: '请输入用户名', trigger: 'blur' },
                { min: 3, max: 10, message: '用户名的长度控制在3-10个字之间', trigger: 'blur' },
                ],
                email: [{ required: true, message: '请输入邮箱', trigger: 'blur' },
                { validator: checkEmail, trigger: 'blur' },
                ],
                mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' },
                { validator: checkPhone, trigger: 'blur' }]
            },
            setUserDialog: false,//控制分配角色弹窗
            userInfo: {},//需要被分配角色的
            roleList: [],//角色数据列表
            selectRoleId: '',//角色选择id
        }
    },
    created() {
        this.getUserList()
    },
    methods: {
        async getUserList() {
            const { data: res } = await this.$http.get('users', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.userList = res.data.users
            this.total = res.data.total
            this.pagenum = res.data.pagenum
            this.$message.success(res.meta.msg)
        },
        // 显示添加弹框
        addDialogF() {
            this.addDialog = true

        },
        // 添加用户验证
        addUsers() {
            this.$refs.addFormref.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.post('users', this.addForm)
                console.log(res)
                if (res.meta.status !== 201) return this.$message.error('添加失败')
                this.$message.success('添加成功')
                this.addDialog = false
                this.getUserList()
            })
        },
        addClose() {
            this.$refs.addFormref.resetFields()
        },
        clear() {
            this.getUserList()
        },
        serach() {
            this.getUserList()
        },
        // 点击编辑按钮赋值详情
        async editDialogF(id) {
            const { data: res } = await this.$http.get('users/' + id)
            if (res.meta.status !== 200) return this.$message.error('获取失败')
            this.editForm = res.data
            this.editDialog = true
        },
        //删除用户
        async removeUser(id) {
            const confirmRes = await this.$confirm('是否删除该用户？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err =>
                err
            )

            if (confirmRes !== 'confirm') return this.$message.info('已取消删除')
            const { data: res } = await this.$http.delete('users/' + id)
            console.log(res)
            if (res.meta.status !== 200) return this.$message.error('删除用户失败')
            this.$message.success('删除用户成功')
            this.getUserList()
        },
        editClose() {
            this.$refs.editFormref.resetFields()
        },
        // 修改用户信息
        editUser() {
            this.$refs.editFormref.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.put('users/' + this.editForm.id, {
                    email: this.editForm.email, mobile: this.editForm.mobile
                })
                if (res.meta.status !== 200) return this.$message.error('编辑用户失败')
                this.editDialog = false

                this.getUserList()
                this.$message.success('编辑用户成功')

            })
        },
        // 修改状态
        async changeState(userInfo) {
            const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
            if (res.meta.status !== 200) {
                userInfo.mg_state = !userInfo.mg_state
                return this.$message.error(res.meta.msg)
            }
            this.$message.success(res.meta.msg)
        },
        // 监听pasesize改变的事件
        handleSizeChange(newsize) {
            this.queryInfo.pagesize = newsize
            this.getUserList()
        },
        // 页码值发生变化
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        // 展示分配角色
        async setRole(userInfo) {

            this.userInfo = userInfo
            const { data: res } = await this.$http.get('roles')

            if (res.meta.status !== 200) return this.$message.error('获取失败')
            this.roleList = res.data
            this.setUserDialog = true
        },

        // 关闭分配弹窗
        setUserClose() {
            this.selectRoleId = ''
            this.userInfo = {}
        },
        // 分配角色
        async allotUsers() {
            if (!this.selectRoleId) return this.$message.error('选择id')
            const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
                rid: this.selectRoleId
            })
            if (res.meta.status !== 200) return this.$message.error('分配失败')
            this.$message.success('分配成功')
            this.getUserList()
            this.setUserDialog = false
        },
    }
}
</script>

<style scoped lang="less">
</style>