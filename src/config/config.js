module.exports = {
  port: 8080,
  db: {
    database: process.env.DB_NAME || 'vue-blog',
    user: process.env.DB_USER || 'vue-blog',
    password: process.env.DB_PASSWD || 'vue-blog',
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
