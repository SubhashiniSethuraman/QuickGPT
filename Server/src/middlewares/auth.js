import jwt from 'jsonwebtoken'
import { getDB } from '../configs/db.js';
import { ObjectId } from 'mongodb';

export const protect = async (req, res, next) => {
    //Get token from headers
    let token = req.headers.authorization?.split(" ")[1];

    try {
        //Verify the token is valid with secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //If so, attach userId to it
        const userId = decoded.id;

        const db = getDB();
        //Check the user exist in collection (Original user of ours)
        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

        //If not, user not found in our database
        if (!user) {
            return res.json({
                success: false,
                message: "Not authorized, User not found"
            })
        }

        //Attach user details in middleware itself. So that easy access later in controller
        req.user = user;

        //Allows next controller to run
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, Token failed"
        })
    }
}