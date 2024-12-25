<template>
  <div class="app-container">
    <el-table
      :data="tableData"
      style="width: 100%"
      border
    >
      <el-table-column
        prop="employee_id"
        label="员工ID"
        width="80"
      />
      <el-table-column
        prop="first_name"
        label="名"
        width="120"
      />
      <el-table-column
        prop="last_name"
        label="姓"
        width="120"
      />
      <el-table-column
        prop="email"
        label="邮箱"
      />
      <el-table-column
        prop="hire_date"
        label="入职日期"
        width="180"
      />
      <el-table-column
        prop="salary"
        label="薪资"
        width="120"
      />
    </el-table>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ComplexTable',
  data() {
    return {
      tableData: []
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
    }
  }
}
</script>
