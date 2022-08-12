<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row>
                <el-button type="primary">添加角色</el-button>
            </el-row>

            <el-table :data="rolesList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', 'vcenter', i1 === 0 ? 'bdtop' : '']"
                            v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <!-- 一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="remove(scope.row, item1.id)">
                                    {{ item1.authName }}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 二级三级权限 -->
                            <el-col :span="19">
                                <el-row :class="['vcenter', i2 === 0 ? '' : 'bdtop']"
                                    v-for="(item2, i2) in item1.children" :key="item2.id">
                                    <!-- 二级权限 -->
                                    <el-col :span="6">
                                        <el-tag closable @close="remove(scope.row, item2.id)" type="success">
                                            {{ item2.authName }}
                                        </el-tag>
                                        <i class="el-icon-caret-right">

                                        </i>
                                    </el-col>
                                    <!-- 三级权限 -->
                                    <el-col :span="13">
                                        <el-tag closable @close="remove(scope.row, item3.id)" type="warning"
                                            v-for="(item3, i3) in item2.children" :key="item3.id">
                                            {{ item3.authName }}
                                        </el-tag>

                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                        <el-button size="mini" @click="showSetRight(scope.row)" type="warning" icon="el-icon-setting">
                            分配权限
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog title="分配权限" :visible.sync="setRightDialog" width="50%" @close="setRightClose">
            <!-- 树形控件 -->
            <el-tree ref="elTree" :data="rightList" :props="props" show-checkbox node-key="id" default-expand-all
                :default-checked-keys="defKeys">
            </el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialog = false">取 消</el-button>
                <el-button @click="allotRights" type="primary">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>

export default {
    data() {
        return {
            rolesList: [],
            setRightDialog: false,//分配权限的弹框
            rightList: [],
            props: {
                label: 'authName',
                children: 'children'
            },
            defKeys: [],
            roleId: ''
        }
    },

    created() {
        this.getRolesList()
    },
    methods: {
        async getRolesList() {
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            this.$message.success('获取数据成功')
            this.rolesList = res.data
        },
        async remove(role, rightId) {
            const congfigRes = await this.$confirm('删除该标签', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if (congfigRes === 'cancel') return this.$message.info('已取消操作')
            const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if (res.meta.status !== 200) return this.$message.error('删除权限失败')
            // role.children = res.data; 
            this.$set(role, 'children', res.data);
            this.$message.success('删除权限成功')
        },
        async showSetRight(role) {
            this.roleId = role.id
            const { data: res } = await this.$http.get('rights/tree')
            if (res.meta.status !== 200) return this.$message.error('获取权限失败')
            this.rightList = res.data
            console.log(res.data)
            this.getLeafKeys(role, this.defKeys)
            this.setRightDialog = true
        },
        setRightClose() {
            this.defKeys = []
        },

        async allotRights() {
            const keys = [...this.$refs.elTree.getHalfCheckedKeys(), ...this.$refs.elTree.getCheckedKeys()]
            const idStr = keys.join(',')


            const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
            if (res.meta.status !== 200) return this.$message.error('选择失败')
            this.$message.success('选择成功')
            this.setRightDialog = false
            this.getRolesList()
        },

        // 递归获取所有三级权限的id 并保存至defKeys
        getLeafKeys(node, arr) {
            if (!node.children) {
                return arr.push(node.id)
            }
            node.children.forEach(item => {
                this.getLeafKeys(item, arr)
            });
        }
    }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}

.bdtop {
    border-top: 1px solid #eee;
}

.bdbottom {
    border-bottom: 1px solid #eee;

}

.vcenter {
    display: flex;
    align-items: center;
}
</style>