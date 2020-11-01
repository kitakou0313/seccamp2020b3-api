const CosmosClient = require('@azure/cosmos').CosmosClient;
const client = new CosmosClient(process.env.seccamp2020b3_DOCUMENTDB);

module.exports = async function (context, req) {
    context.log(`x-ms-client-principal-name: ${req.headers['x-ms-client-principal-name']}`);

    const self_id = req.headers['x-ms-client-principal-name'];

    if (self_id == null) {
        context.res = {
            status: 400,
            body: `login`,
        };
        return;
    }

    const result = await client.database("handson").container("follows").item(self_id, self_id).read();
    const follows = result.resource;

    if (!follows || !follows.length) {
        context.res = {
            status: 400,
            body: `no follows`,
        };
        return;
    }

    const query = {
        // TODO: followsがc.user_idであるものの中でparititon_key順に50件
        query: "SELECT * FROM c WHERE ARRAY_CONTAINS(@follows, c.user_id) ORDER BY c.partition_key DESC limit 50;",
        parameters: [
            {
                name: "@follows",
                value: follows,
            }
        ]
    };
    const result2 = await client.database("handson").container("messages")
        .items.query(query).fetchAll();
    
    context.log(`Cosmos DB result: ${JSON.stringify(result2)}`);

    const msgs = result2.resources.map(e => ({user_id: e.user_id, timestamp: e.timestamp, text: e.text}));

    context.res = {
        status: 200,
        body: {msgs}
    };
}