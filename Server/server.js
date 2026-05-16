import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { connectDB } from './src/configs/db.js'
import userRouter from './src/routes/userRoutes.js'
import chatRouter from './src/routes/chatRoutes.js'
import messageRouter from './src/routes/messageRoutes.js'
import creditRouter from './src/routes/creditRoutes.js'
import { stripeWebhooks } from './src/controllers/webhook.js'

const app = express()

await connectDB()

//Stripe Webhooks
app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)

//Middleware
app.use(cors())
app.use(express.json())

//Routes
app.get('/', (req, res) => res.send('Server is live'))
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/credit', creditRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
