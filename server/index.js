const express = require('express')
const oracledb = require('oracledb')
const cors = require('cors')
const mysql = require('mysql2/promise')

const app = express()
app.use(cors())
app.use(express.json())

// Oracle 数据库连接配置（远程服务器）
const oracleConfig = {
  user: 'system',
  password: '18421.Wjp',
  connectString: 'localhost:1521/orcl'  // 修改为远程 Oracle 服务器地址
}

// MySQL 数据库连接配置（另一个远程服务器）
const mysqlConfig = {
  host: '8.137.103.189',
  user: 'root',
  password: '18421.wjp',
  database: 'datax',
  // 添加额外的连接选项
  connectTimeout: 10000, // 连接超时时间
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// 从 Oracle 获取数据的 API
app.get('/api/employees', async (req, res) => {
  let connection
  try {
    // 连接远程 Oracle 数据库
    connection = await oracledb.getConnection(oracleConfig)

    const result = await connection.execute(
      `SELECT * FROM HR.JOBS`,
      [], // 绑定变量
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // 返回对象格式
    )

    res.json(result.rows)
  } catch (err) {
    console.error('Oracle 查询错误:', err)
    res.status(500).json({ error: '数据库查询错误: ' + err.message })
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (err) {
        console.error('关闭 Oracle 连接错误:', err)
      }
    }
  }
})

// 导入数据到 MySQL 的 API
app.post('/api/import-to-mysql', async (req, res) => {
  let connection
  try {
    const { data } = req.body

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: '无效的数据格式' })
    }

    // 连接远程 MySQL 数据库
    connection = await mysql.createConnection(mysqlConfig)

    // 开始事务
    await connection.beginTransaction()

    const insertQuery = `
      INSERT INTO datax_target
      (JOB_ID, JOB_TITLE, MAX_SALARY, MIN_SALARY)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    // 批量插入数据
    for (const row of data) {
      await connection.execute(insertQuery, [
        row.JOB_ID,
        row.JOB_TITLE,
        row.MAX_SALARY,
        row.MIN_SALARY
      ])
    }

    // 提交事务
    await connection.commit()

    res.json({ message: '数据导入成功' })
  } catch (err) {
    // 发生错误时回滚事务
    if (connection) {
      await connection.rollback()
    }
    console.error('MySQL 导入错误:', err)
    res.status(500).json({ message: '导入数据失败: ' + err.message })
  } finally {
    if (connection) {
      try {
        await connection.end()
      } catch (err) {
        console.error('关闭 MySQL 连接错误:', err)
      }
    }
  }
})

// 添加错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  res.status(500).json({ error: '服务器内部错误' })
})

const port = 3000
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`)
})
