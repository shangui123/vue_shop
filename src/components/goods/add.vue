<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
            </el-alert>

            <!-- 步骤区 -->
            <el-steps align-center :space="200" :active="activeIndex - 0" finish-status="success">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- 侧边tab区 -->
            <el-form :model="addForm" :rules="addRules" ref="addForm" label-position="top" label-width="100px">
                <el-tabs @tab-click="tabChange" :before-leave="beforeL" v-model="activeIndex" :tab-position="'left'">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader v-model="addForm.goods_cat" :options="categorieList" :props="props"
                                expand-trigger="hover" @change="handleChange"></el-cascader>
                        </el-form-item>


                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item v-for='(item, i) in propsList' :key="i" :label="item.attr_name">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox v-for="(db, i2) in item.attr_vals" :key="i2" border :label="db">
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item v-for='(item, i) in onlyList' :key="item.attr_id" :label="item.attr_name">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload list-type="picture" :action="picAction" :on-preview="handlePreview"
                            :on-remove="handleRemove" :headers="headersObj" :on-success="handleSucc">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>

                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本 -->

                        <quill-editor class="ql_editor" v-model="addForm.goods_introduce"></quill-editor>
                        <el-button type="primary" @click="addFormF" class="addBtn">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览 -->
        <el-dialog title="图片预览" :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
    data() {
        return {
            attr_vals: ['选中且禁用', '复选框 A'],
            activeIndex: 0,
            addForm: {
                goods_name: '',
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                goods_cat: '',
                pics: [],
                goods_introduce: '',
                attrs: []
            },
            addRules: {
                goods_name: [
                    { required: true, message: '请输入商品名称', trigger: 'blur' }
                ],
                goods_price: [
                    { required: true, message: '请输入商品价格', trigger: 'blur' }
                ],
                goods_weight: [
                    { required: true, message: '请输入商品重量', trigger: 'blur' }
                ],
                goods_number: [
                    { required: true, message: '请输入商品数量', trigger: 'blur' }
                ],
                goods_cat: [
                    { required: true, message: '请选择商品类型', trigger: 'blur' }
                ],
            },
            categorieList: [],
            props: {
                label: 'cat_name',
                value: 'cat_id',
                children: 'children',
            },
            propsList: [],
            onlyList: [],
            picAction: 'https://lianghj.top:8888/api/private/v1/upload',
            dialogImageUrl: '',
            dialogVisible: false,
            headersObj: {
                Authorization: window.sessionStorage.getItem('token')
            }
        }
    },
    created() {
        this.getCategorie()
    },

    computed: {
        cateId() {
            if (this.addForm.goods_cat.length === 3) {
                return this.addForm.goods_cat[2]
            }
            return null
        }
    },

    methods: {
        // 获取商品列表
        async getCategorie() {
            const { data: res } = await this.$http.get('categories')

            if (res.meta.status !== 200) return this.$message.error('获取列表失败')
            this.categorieList = res.data
        },

        // 切换商品类型
        handleChange() {
            if (this.addForm.goods_cat.length !== 3) {
                this.addForm.goods_cat = ''
                return
            }
        },

        // 侧边tab切换前的操作
        beforeL(newTab, oldTab) {
            if (oldTab === '0' && this.addForm.goods_cat.length !== 3) {
                this.$message.error('请选择商品类型')
                return false
            }
        },

        // 切换tab时 当前的tab
        async tabChange() {
            if (this.activeIndex === '1') {
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: { sel: 'many' }
                })
                if (res.meta.status !== 200) return this.$message.error('获取属性失败')
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                    return item
                })

                this.propsList = res.data
            } else if (this.activeIndex === '2') {
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: { sel: 'only' }
                })
                if (res.meta.status !== 200) return this.$message.error('获取属性失败')
                this.onlyList = res.data
            }
        },
        // 全局展示
        handlePreview(file) {

            // console.log(file.response.data.url)

            this.dialogImageUrl = file.url;
            this.dialogVisible = true;
        },
        // 删除图片
        handleRemove(file, fileList) {
            const picUrl = file.response.data.tmp_path
            const picIndex = this.addForm.pics.findIndex(x => {
                x.pics === picUrl
            })
            this.addForm.pics.splice(picIndex, 1)
        },

        // 上传成功
        handleSucc(response, file, fileList) {
            let picsInfo = {
                pics: file.response.data.tmp_path
            }
            this.addForm.pics.push(picsInfo)
        },
        // 添加商品
        addFormF() {
            this.$refs.addForm.validate(async valid => {
                console.log(valid, this.addForm)
                const form = _.cloneDeep(this.addForm)
                form.goods_cat = this.addForm.goods_cat.join(',')


                this.propsList.forEach(item => {
                    const info = {
                        attr_value: item.attr_vals.join(' '),
                        attr_id: item.attr_id
                    }
                    this.addForm.attrs.push(info)
                })
                this.onlyList.forEach(item => {
                    const info = {
                        attr_value: item.attr_vals,
                        attr_id: item.attr_id
                    }
                    this.addForm.attrs.push(info)
                })

                form.attrs = this.addForm.attrs
                const { data: res } = await this.$http.post('goods', form)
                if (res.meta.status !== 201) return this.$message.error('添加失败')
                this.$message.success('添加成功')
                this.$router.push('/goods')
            })
        },
    }
}
</script>

<style lang="less" scoped>
.el-checkbox {
    margin: 0 5px 0 0 !important;
}

.addBtn {
    margin-top: 15px;
}
</style>