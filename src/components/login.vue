<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像去 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录表单区 -->
            <el-form :rules="rules" :model="loginForm" class="login_form" ref="form" label-width="0px">
                <!-- 用户名 -->
                <el-form-item prop='username'>
                    <el-input v-model="loginForm.username" prefix-icon="el-icon-s-custom"></el-input>
                </el-form-item>
                <!-- 密码   -->
                <el-form-item prop='password'>
                    <el-input v-model="loginForm.password" prefix-icon="el-icon-lock"></el-input>
                </el-form-item>
                <!-- 按钮区域 -->
                <el-form-item class="btns">
                    <el-button @click="login" type="primary">登录</el-button>
                    <el-button @click="reset" type="info">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            loginForm: {
                username: '',
                password: ''
            },
            rules: {
                username: [
                    { required: true, message: '请输入登录账号', trigger: 'blur' },
                    { required: true, message: '请输入活动名称', trigger: 'blur' },
                ],
                password: [{ required: true, message: '请输入登录密码', trigger: 'blur' },]
            }
        }

    },
    methods: {
        reset() {
            this.$refs.form.resetFields()
        },
        login() {
            this.$refs.form.validate(async valid => {
                if (!valid) return;

                let { data: res } = await this.$http.post('login', this.loginForm)
                if (res.meta.status !== 200) return this.$message.error('登录失败')
                this.$message.success('登录成功')

                window.sessionStorage.setItem('token', res.data.token)
                this.$router.push('/home')
            })
        }
    }
}
</script>

<style lang="less" scoped>
.login_container {
    background-color: #2b4b6b;
    height: 100%;
}

.login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
        height: 130px;
        width: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #eee;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -65px);
        background-color: #fff;

        img {
            height: 100%;
            width: 100%;
            border-radius: 50%;
            background-color: #eee;

        }
    }
}

.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}

.btns {
    display: flex;
    justify-content: flex-end;
}
</style>