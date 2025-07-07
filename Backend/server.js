import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import inviteRoutes from './routes/inviteRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import savingPdfRoutes from './routes/savingPdfRoutes.js'
import http from 'http'
import { Server } from 'socket.io'

dotenv.config()
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// DB
connectDB()

// Create HTTP server and Socket.IO
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as needed for production
    methods: ['GET', 'POST', 'DELETE']
  }
})

// Make io accessible in routes/controllers
app.set('io', io)

// Routes
app.use('/api', authRoutes)
app.use('/api/invites', inviteRoutes) 
app.use('/api/groups', groupRoutes)
app.use('/api/pdf', savingPdfRoutes)

import commentRoutes from './routes/commentRoutes.js';
app.use('/api/comments', commentRoutes);

import highlightRoutes from './routes/highlightRoutes.js';
app.use('/api/highlights', highlightRoutes);

import chatRoutes from './routes/chatRoutes.js';
app.use('/api/chat', chatRoutes);


const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

app.get('/', (req, res) => {
  res.send('Server is running!')
})

