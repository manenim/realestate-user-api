const db = require("../utils/db");
const {
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand,
    UpdateItemCommand,
    // QueryCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");


// create welcome route and return a welcome message
const welcome = async () => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Welcome to the serverless realesstate users API!",
        }),
    };
};



const getUser = async (event) => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ userId: event.pathParameters.userId }),
        };
        const { Item } = await db.send(new GetItemCommand(params));

        console.log({ Item });
        response.body = JSON.stringify({
            message: "Successfully retrieved user.",
            data: (Item) ? unmarshall(Item) : {},
            rawData: Item,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to get user.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const createUser = async (event) => {
    const response = { statusCode: 200 };

    try {
        const body = JSON.parse(event.body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(body || {}),
        };
        const createResult = await db.send(new PutItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully created user.",
            createResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to create user.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const updateUser = async (event) => {
    const response = { statusCode: 200 };

    try {
        const body = JSON.parse(event.body);
        const objKeys = Object.keys(body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ userId: event.pathParameters.UserId }),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key],
            }), {})),
        };
        const updateResult = await db.send(new UpdateItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully updated user.",
            updateResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to update user.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const deleteUser = async (event) => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ userId: event.pathParameters.userId }),
        };
        const deleteResult = await db.send(new DeleteItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully deleted user.",
            deleteResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to delete user.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const getAllUsers = async () => {
    const response = { statusCode: 200 };

    try {
        const { Items } = await db.send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME }));

        response.body = JSON.stringify({
            message: "Successfully retrieved all users.",
            data: Items.map((item) => unmarshall(item)),
            Items,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to retrieve users.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

module.exports = {
    welcome,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers,
    // getPostByAuthor
};