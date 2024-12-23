import pkg from 'mongoose';
import { Users } from './models.js'
const { connect } = pkg;
export var cachedUsers = {}
export var db;

export async function connectToDB(url) {
    db = await connect(url, {
        serverApi: {
            version: '1',
            strict: true,
            deprecationErrors: true
        }
    })
    console.log("Connected to DB successfully")
}

export async function createUser(id, bal) {
    const find = await getUser(id)
    if (find !== null) return find

    const user = new Users({
        uid: id,
        balance: bal ?? 0,
    })

    const res = await user.save()
    return res
}

export async function forceGetUser(id) {
    let query = await Users.find({ uid: id })
    if (query.length !== 1) {
        return await createUser(id)
    }
    return query[0]
}

export async function getUser(id) {
    let query = await Users.find({ uid: id })
    if (query.length !== 1) return null
    return query[0]
}

export async function getUsers() {
    return await Users.find({})
}

export async function getSortedUsers() {
    return (await getUsers()).sort((a, b) => b.balance - a.balance)
}
export async function addMoney(userId, amount) {
    const user = await getUser(userId);
    if (user) {
        user.balance += amount;
        await user.save();
        return user;
    } else {
        try {
            const newUser = await createUser(userId, amount); 
            return newUser;
        } catch (error) {
            console.error(`Error creating user ${userId}:`, error);
            return null; 
        }
    }
}
export async function updateUserLastBeg(userId, timestamp) {
    const user = await getUser(userId);
    if (user) {
        user.lastBeg = timestamp;
        await user.save();
        return true;
    } else {
        return false;
    }
}