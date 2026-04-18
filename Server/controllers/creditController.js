import { getDB } from "../configs/db.js"
import { transactionSchema } from "../models/transactionModel.js"
import Stripe from "stripe"
import { ObjectId } from "mongodb";

const plans = [
    {
        _id: "basic",
        name: "Basic",
        price: 10,
        credits: 100,
        features: ['100 text generations', '50 image generations', 'Standard support', 'Access to basic models']
    },
    {
        _id: "pro",
        name: "Pro",
        price: 20,
        credits: 500,
        features: ['500 text generations', '200 image generations', 'Priority support', 'Access to pro models', 'Faster response time']
    },
    {
        _id: "premium",
        name: "Premium",
        price: 30,
        credits: 1000,
        features: ['1000 text generations', '500 image generations', '24/7 VIP support', 'Access to premium models', 'Dedicated account manager']
    }
]

//Getting all plans
export const getPlans = async (req, res) => {
    try {
        //plans from above json
        res.json({success: true, plans})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

//Purchasing a plan
export const purchasePlans = async (req, res) => {
  try {
    const db = getDB();

    const { planId } = req.body;
    const userId = req.user._id;

    const plan = plans.find(plan => plan._id == planId);

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Invalid Plan"
      });
    }

    const transactionData = {
      userId: userId.toString(),
      planId: plan._id,
      amount: plan.price,
      credits: plan.credits
    };

    const { error, value } = transactionSchema.validate(transactionData);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // 1. Insert transaction first
    const transaction = await db.collection("transactions").insertOne({
      ...value,
      userId: new ObjectId(value.userId),
      isPaid: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const { origin } = req.headers;

    // 2. Create Stripe session
    //Stripe’s expected object
    //Ask Stripe to generate a checkout payment session.
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: plan.price * 100,
            product_data: {
              name: plan.name
            }
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${origin}/loading`,
      cancel_url: `${origin}/loading`,
      //metadata helps for webhook (transaction update)
      metadata: {
        transactionId: transaction.insertedId.toString(),
        appId: "quickgpt"
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60
    });

    return res.json({
      success: true,
      url: session.url
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
