<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 15px;">
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-plus"
        @click="handleAdd"
      >
        导入数据
      </el-button>
    </div>

    <el-table
      :data="tableData"
      style="width: 100%"
      border
    >
      <el-table-column
        prop="JOB_ID"
        label="员工ID"
      />
      <el-table-column
        prop="JOB_TITLE"
        label="名"
      />
      <el-table-column
        prop="MAX_SALARY"
        label="姓"
      />
      <el-table-column
        prop="MIN_SALARY"
        label="姓"
      />
    </el-table>

    <el-dialog
      title="确认导入"
      :visible.sync="dialogFormVisible"
      width="400px"
    >
      <div class="dialog-content">
        <p>确定要将当前列表中的 {{ tableData.length }} 条数据导入到 MySQL 数据库吗？</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="importing" @click="importData">确认导入</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ComplexTable',
  data() {
    return {
      tableData: [],
      dialogFormVisible: false,
      importing: false
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get('http://localhost:3000/api/employees')
        this.tableData = response.data
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败')
      }
    },
    handleAdd() {
      if (this.tableData.length === 0) {
        this.$message.warning('当前没有可导入的数据')
        return
      }
      this.dialogFormVisible = true
    },
    async importData() {
      if (this.importing) return
      this.importing = true

      try {
        // 发送数据到后端进行导入
        await axios.post('http://localhost:3000/api/import-to-mysql', {
          data: this.tableData
        })

        this.dialogFormVisible = false
        this.$message({
          type: 'success',
          message: '数据导入成功'
        })
      } catch (error) {
        console.error('数据导入失败:', error)
        this.$message.error('数据导入失败: ' + (error.response?.data?.message || error.message))
      } finally {
        this.importing = false
      }
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  margin-right: 10px;
}
.dialog-content {
  text-align: center;
  padding: 20px 0;
}
</style>
