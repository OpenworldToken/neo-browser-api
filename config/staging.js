module.exports = {
    app: {
      host: '0.0.0.0', // host
      port: '5001', // port
      apiPrefix: '/api/v1' // api 前缀
    },
    rpc: process.env.RPC,
    network: process.env.NETWORK,
    dbGlobal: process.env.MONGODB_URL
  }
  