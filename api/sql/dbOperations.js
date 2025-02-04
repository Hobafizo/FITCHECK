var sql = require('mssql/msnodesqlv8');

var conObj =
{
    server: '.\\SQLSERVER',
    database: 'FitCheck',
    user: 'sa',
    password: '696696',
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
        console.log('Failed to connect to database: '.concat(error))
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
        console.log('Failed to close database connection: '.concat(error))
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