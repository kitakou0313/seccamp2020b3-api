const CosmosClient = require('@azure/cosmos').CosmosClient;
const client = new CosmosClient(process.env.seccamp2020b3_DOCUMENTDB);

module.exports = async function (context, req) {
    context.log(`x-ms-client-principal-name: ${req.headers['x-ms-client-principal-name']}`);

    if (req.headers['x-ms-client-principal-name'] == null) {
        context.res = {
            status: 403,
        };
        return;
    }

    if (req.body == null || req.body.user == null) {
        context.res = {
            status: 400,
            body: `missing text`,
        };
        return;
    }

    const self_id = req.headers['x-ms-client-principal-name'];
    const target_id = req.body.user;

    const result = await client.database("handson").container("follows").item(self_id, self_id).read();
    const follows = result.resource ?? [];

    context.bindings.outputDocument = {
        id: self_id,
        user_id: self_id,
        partition_key: self_id,
        follows: [...follows, target_id],
    }

    context.res = {
        status: 201,
    };
}