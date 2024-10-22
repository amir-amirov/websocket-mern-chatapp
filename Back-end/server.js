// METHOD 1: WebSocket connection handles both get and post functions

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Express Setup
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

// Start express server
const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// WebSocket Setup (Upgrade server)
const wss = new WebSocket.Server({ server });

// Users Schema
const usersSchema = new mongoose.Schema({
  _id: { type: String, },
  name: { type: String },
  email: { type: String, required: true },
  avatar: { type: String },
});

const UsersModel = mongoose.model('pokemons', usersSchema);

// Messages Schema
const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    avatar: { type: String },
});

const MessageModel = mongoose.model('Message', messageSchema);

// WebSocket connection
wss.on('connection', async (ws) => {
    console.log('New client connected');

    const messages = await MessageModel.find();
    if (messages) {
      ws.send(JSON.stringify({ event: 'message_update', data: messages })); // Send initial messages
    }

    ws.on('message', async (message) => {

      const parsedMessage = JSON.parse(message); // body parser can handle only http requests
      //console.log("Got message", parsedMessage.action)
      if (parsedMessage.action === 'sendMessage') {
          const { name, text, avatar } = parsedMessage.data;
          const newMessage = new MessageModel({ name, text, avatar });
          await newMessage.save();

          const messages = await MessageModel.find();
          wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({ event: 'message_update', data: messages }));
              }
          });
      }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});


// Retrieve all users from "users" collection
app.get('/users', async (req, res) => {
  try {
      const allUsers = await UsersModel.find(); 
      res.status(200).json(allUsers); 
  } catch (error) {
      res.status(500).send({ message: 'Error fetching documents', error: error.message });
  }
});

// Retrieve a user by provided id
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const user = await UsersModel.findById(id); 
      if (!user) {
          return res.status(404).send({ message: 'Document not found' });
      }
      res.status(200).json(user);
  } catch (error) {
      res.status(500).send({ message: 'Error fetching document', error: error.message });
  }
});

// Create user in the "users" collection
app.post('/user', async (req, res) => {
    const data = req.body;
    console.log(data);
  
    const newUser = new UsersModel(data);
    await newUser.save();
    console.log('User added to "users" collection');
    
    res.json({ received: newUser });
  });  

// Update a user by provided id
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;  // Data to update

  try {
    // Find the user by ID and update with the new data from req.body
    const updatedUser = await UsersModel.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });

    // If user not found
    if (!updatedUser) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Respond with the updated user data
    res.status(200).json(updatedUser);
  } catch (error) {
    // Handle error
    res.status(500).send({ message: 'Error updating user', error: error.message });
  }
});

// METHOD 2: WebSocket broadcasts changes and REST API handles post methods
// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const WebSocket = require('ws');

// // MongoDB Connection
// const mongoURI = process.env.MONGODB_URI
// mongoose.connect(mongoURI)
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.error('MongoDB connection error:', err));

// // Express Setup
// const app = express();
// const port = process.env.PORT || 3000;
// app.use(bodyParser.json());

// // Start express server
// const server = app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });

// // WebSocket Setup (Upgrade server)
// const wss = new WebSocket.Server({ server });

// // Users Schema
// const usersSchema = new mongoose.Schema({
//   _id: { type: String, },
//   name: { type: String },
//   email: { type: String, required: true },
//   avatar: { type: String },
// });

// const UsersModel = mongoose.model('pokemons', usersSchema);

// // Messages Schema
// const messageSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     text: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
//     avatar: { type: String },
// });

// const MessageModel = mongoose.model('Message', messageSchema);

// // WebSocket connection
// wss.on('connection', async (ws) => {
//     console.log('New client connected');

//     const messages = await MessageModel.find();
//     if (messages) {
//       ws.send(JSON.stringify(messages)); // Send initial messages
//     }

//     // ws.on('message', async (message) => {

//     //   if (message.action === 'sendMessage') {
//     //       const { _id, text, createdAt } = message.data;
//     //       const newMessage = new MessageModel({ _id, text, createdAt });
//     //       await newMessage.save();

//     //       const messages = await MessageModel.find();
//     //       ws.clients.forEach(client => {
//     //           if (client.readyState === WebSocket.OPEN) {
//     //               client.send(JSON.stringify({ event: 'message_update', data: messages }));
//     //           }
//     //       });
//     //   }
//     // });
    
//     // Listen messages collection for changes
//     const changeStream = MessageModel.watch();
//     changeStream.on('change', async (change) => {
//         if (change.operationType === 'insert') {
//             const messages = await MessageModel.find();
//             ws.send(JSON.stringify(messages));
//         }
//     });

//     ws.on('close', () => {
//         console.log('Client disconnected');
//         changeStream.close(); // Close the change stream when client disconnects
//     });
// });


// // Add a new message
// app.post('/message', async (req, res) => {
//     const { name, text, createdAt, avatar } = req.body;

//     try {
//         const newMessage = new MessageModel({ name, text, avatar });
//         await newMessage.save();
//         res.status(201).json(newMessage);

//         // Notify all clients about the new message
//         const messages = await MessageModel.find();
//         // wss.clients.forEach(client => {
//         //     if (client.readyState === WebSocket.OPEN) {
//         //         client.send(JSON.stringify(messages));
//         //     }
//         // });
//     } catch (error) {
//         console.error('Error saving message:', error);
//         res.status(500).send({ message: 'Error saving message' });
//     }
// });

// // Retrieve all users from "users" collection
// app.get('/users', async (req, res) => {
//   try {
//       const allUsers = await UsersModel.find(); 
//       res.status(200).json(allUsers); 
//   } catch (error) {
//       res.status(500).send({ message: 'Error fetching documents', error: error.message });
//   }
// });

// // Retrieve a user by provided id
// app.get('/users/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//       const user = await UsersModel.findById(id); 
//       if (!user) {
//           return res.status(404).send({ message: 'Document not found' });
//       }
//       res.status(200).json(user);
//   } catch (error) {
//       res.status(500).send({ message: 'Error fetching document', error: error.message });
//   }
// });

// // Create user in the "users" collection
// app.post('/user', async (req, res) => {
//     const data = req.body;
//     console.log(data);
  
//     const newUser = new UsersModel(data);
//     await newUser.save();
//     console.log('User added to "users" collection');
    
//     res.json({ received: newUser });
//   });  

// // Update a user by provided id
// app.put('/users/:id', async (req, res) => {
//   const { id } = req.params;
//   const updates = req.body;  // Data to update

//   try {
//     // Find the user by ID and update with the new data from req.body
//     const updatedUser = await UsersModel.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });

//     // If user not found
//     if (!updatedUser) {
//       return res.status(404).send({ message: 'User not found' });
//     }

//     // Respond with the updated user data
//     res.status(200).json(updatedUser);
//   } catch (error) {
//     // Handle error
//     res.status(500).send({ message: 'Error updating user', error: error.message });
//   }
// });