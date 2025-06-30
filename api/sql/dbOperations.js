var sql = require('mssql/msnodesqlv8');

var conObj =
{
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DB,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    connectionTimeout: 50000,
    requestTimeout: 50000
};

var sqlCon;

async function connect()
{
    if (sqlCon != null)
    {
        console.log('Database connection already open!')
        return null
    }

    try
    {
        sqlCon = await sql.connect(conObj)
        console.log('Database connected successfully')

        return sqlCon
    }
    catch (error)
    {
        console.log('Failed to connect to database')
        console.log(error)
    }
    return null
}

async function disconnect()
{
    try
    {
        await sqlCon.close()
    }
    catch (error)
    {
        console.log('Failed to close database connection')
        console.log(error)
    }
}

async function request()
{
    return await sqlCon.request()
}

async function execute(command)
{
    return await sqlCon.request().query(command)
}

module.exports =
{
    sqlCon,
    connect,
    disconnect,
    request,
    execute
};