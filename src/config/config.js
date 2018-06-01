module.exports = {
  port: 8080,
  db: {
    database: process.env.DB_NAME || 'YueBa',
    user: process.env.DB_USER || 'YueBa',
    password: process.env.DB_PASSWD || 'YueBa',
    options: {
      dialect: process.env.DIALECT || 'sqlite',
      host: process.env.HOST || 'localhost',
      storage: './YueBa.sqlite'
    }
  },
  authServiceToken: {
    secretKey: process.env.SECRET || 'secret'
  }
}
