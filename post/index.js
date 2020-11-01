module.exports = async function (context, req) {
    context.log(`x-ms-client-principal-name: ${req.headers['x-ms-client-principal-name']}`);

    if (req.headers['x-ms-client-principal-name'] == null) {
        context.res = {
            status: 403,
        };
        return;
    }

    if (req.body == null || req.body.text == null) {
        context.res = {
            status: 400,
            body: `missing text`,
        };
        return;
    }

    const user_id = req.headers['x-ms-client-principal-name'];
    const timestamp = Date.now();
    const text = req.body.text;

    context.bindings.outputDocument = {
        id: timestamp.toString(),
        user_id,
        timestamp,
        text,
    }

    context.res = {
        status: 201,
    };
}