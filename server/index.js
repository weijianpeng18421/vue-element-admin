const express = require('express')
const oracledb = require('oracledb')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// Oracle 连接配置
const dbConfig = {
  user: 'system',
  password: '18421.Wjp',
  connectString: 'localhost:1521/orcl'
}

// API 端点
app.get('/api/employees', async (req, res) => {
  let connection
  try {
    connection = await oracledb.getConnection(dbConfig)

    const result = await connection.execute(
      `SELECT * FROM HR.JOBS`
    )

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '数据库查询错误' })
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (err) {
        console.error(err)
      }
    }
  }
})

app.listen(3000, () => {
  console.log('服务器运行在 3000 端口')
})
