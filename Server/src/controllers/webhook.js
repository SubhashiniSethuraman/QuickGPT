import Stripe from "stripe";
import { transactionSchema } from "../models/transactionModel.js";
import { getDB } from "../configs/db.js";
import { ObjectId } from "mongodb";

export const stripeWebhooks = async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const sig = req.headers["stripe-signature"]

    let event;

    try {
        //Checks:
        //✅ request really came from Stripe
        //✅ body not modified
        //✅ correct webhook secret
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    }
    catch (error) {
        return res.status(400).json({ success: false, message: `Webhook Error: ${error.message}` })
    }

    try {
        //event -> type -> payment_intent.succeeded -> "Payment completed successfully"
        switch (event.type) {
            case "payment_intent.succeeded": {
                //Get payment details from event.data.object
                const paymentIntent = event.data.object;
                //You want the checkout session because metadata is there.
                const sessionList = await stripe.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                })
                const session = sessionList.data[0];
                if (!sessionList.data.length) throw new Error("No session found");
                //Read Metadata
                //Used to connect Stripe payment to your DB transaction.
                const { transactionId, appId } = session.metadata;

                const db = getDB();

                //appId in Stripe dashboard and in metadata (compare)
                if (appId === 'quickgpt') {
                    // const transaction = await db.collection("transactions").findOne({ _id: new ObjectId(transactionId), isPaid: false })

                    //Update credits in user account in user collection
                    // await db.collection("users").updateOne({_id: transaction.userId}, {$inc: {credits: transaction.credits}})

                    //Update credit Payment status in transaction collection
                    // await db.collection("transactions").updateOne({_id: transaction.userId},{$set: {isPaid: true,updatedAt: new Date()}})

                    const transaction = await db.collection("transactions").findOne({
                        _id: new ObjectId(transactionId),
                        isPaid: false
                    });

                    if (!transaction) throw new Error("Transaction not found");

                    await db.collection("users").updateOne(
                        { _id: transaction.userId },
                        { $inc: { credits: transaction.credits } }
                    );

                    await db.collection("transactions").updateOne(
                        { _id: transaction._id },
                        { $set: { isPaid: true, updatedAt: new Date() } }
                    );
                }
                else {
                    return res.status(200).json({ received: true, message: "Ignored event: Invalid app" })
                }
                break;
            }
            default:
                console.log("Unhandled event type:", event.type)
                break;
        }
        return res.status(200).json({ received: true })
    }
    catch (error) {
        console.error("Webhook processing error:", error);
        return res.status(500).json({ success: false, message: error.message })
    }
}