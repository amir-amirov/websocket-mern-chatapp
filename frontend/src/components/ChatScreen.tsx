// METHOD 1
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../features/slices/userSlice';
import auth from '@react-native-firebase/auth';

const ChatScreen = () => {
  const user = useSelector(state => state.user);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null); 

  const BASE_URL = '192.168.100.3:3000';

  const dispatch = useDispatch()

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`http://${BASE_URL}/users/${userId}`);

      if (!response.ok) throw new Error('Failed to fetch user data');

      const userData = await response.json();
      console.log('Fetched user data:', userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  };

  useEffect(() => {
    const fetchDataAndConnectSocket = async () => {
      try {
        // Fetch user data
        const userData = await fetchUserData(auth().currentUser.uid);
        if (userData) {
          // Dispatch user data to Redux store
          dispatch(setUser(userData));
        }

        // Connect to WebSocket server
        const socket = new WebSocket(`ws://${BASE_URL}`);

        socket.onopen = () => {
          console.log('WebSocket connection established');
        };

        // Listen for messages from the server
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.event === 'message_update') {
            setMessages(data.data); // Update messages state with new messages
          }
        };

        setWs(socket)

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        socket.onclose = () => {
          console.log('WebSocket connection closed');
        };
      } catch (error) {
        console.error('Error fetching data or connecting to WebSocket:', error);
      }
    };

    fetchDataAndConnectSocket();

    return () => {
      socket.close(); // Close WebSocket connection on unmount
    };
  }, []);

  const sendMessage = () => {
    if (text.trim()) {
      const messageData = {
        action: 'sendMessage',
        data: {
          name: user.name, 
          text: text,
          avatar: user.avatar 
        }
      };
      console.log("Trying to send", messageData.action, messageData.data)
      ws.send(JSON.stringify(messageData)); // Send the message data
      setText(''); // Clear the input field
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.messageContainer}>
      <Image style={{ width: 50, height: 50 }} source={{ uri: item.avatar }} resizeMode='cover' />
      <View>
        <Text style={styles.messageAuthor}>{item.name}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="black"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  messageList: {
    paddingBottom: 20,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    flexDirection: "row",
    gap: 20,
  },
  messageAuthor: {
    fontWeight: 'bold',
    marginTop: 5,
  },
  messageText: {
    fontSize: 16,
    color: "black",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    color: "black"
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;

// METHOD 2
// import React, { useEffect, useState } from 'react';
// import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { setUser } from '../features/slices/userSlice';
// import auth from '@react-native-firebase/auth';

// // const BASE_URL = 'http://192.168.100.3:3000';
// const BASE_URL = 'http://192.168.0.101:3000'; 

// const ChatScreen = () => {
//   const user = useSelector(state => state.user);
//   const [text, setText] = useState('');
//   const [messages, setMessages] = useState([]);
//   let socket;

//   const dispatch = useDispatch()

//   const fetchUserData = async (userId) => {
//     try {
//       // const response = await fetch(`http://192.168.100.3:3000/users/${userId}`);
//       const response = await fetch(`http://192.168.0.101:3000/users/${userId}`);

//       if (!response.ok) throw new Error('Failed to fetch user data');

//       const userData = await response.json();
//       console.log('Fetched user data:', userData);
//       return userData;
//     } catch (error) {
//       console.error('Error fetching user data:', error.message);
//     }
//   };

//   useEffect(() => {
//     const fetchDataAndConnectSocket = async () => {
//       try {
//         // Fetch user data
//         const userData = await fetchUserData(auth().currentUser.uid);
//         if (userData) {
//           // Dispatch user data to Redux store
//           dispatch(setUser(userData));
//         }

//         // Connect to WebSocket server
//         // socket = new WebSocket('ws://192.168.100.3:3000');
//         socket = new WebSocket('ws://192.168.0.101:3000');

//         socket.onopen = () => {
//           console.log('WebSocket connection established');
//         };

//         // Listen for messages from the server
//         socket.onmessage = (event) => {
//           const updatedMessages = JSON.parse(event.data);
//           setMessages(updatedMessages);
//         };

//         socket.onerror = (error) => {
//           console.error('WebSocket error:', error);
//         };

//         socket.onclose = () => {
//           console.log('WebSocket connection closed');
//         };
//       } catch (error) {
//         console.error('Error fetching data or connecting to WebSocket:', error);
//       }
//     };

//     fetchDataAndConnectSocket();

//     return () => {
//       socket.close(); // Close WebSocket connection on unmount
//     };
//   }, []);

//   const sendMessage = async () => {
//     if (text.trim() === '') {
//       Alert.alert('Error', 'Message cannot be empty.');
//       return;
//     }

//     try {
//       const response = await fetch(`${BASE_URL}/message`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ name: user.name, text, avatar: user.avatar }),
//       });

//       if (!response.ok) throw new Error('Failed to send message');
//       setText(''); 
//     } catch (error) {
//       console.error('Error sending message:', error);
//       Alert.alert('Error sending message', error.message);
//     }
//   };

// //   const sendMessage = () => {
// //     if (text.trim()) {
// //         const messageData = {
// //             action: 'sendMessage',
// //             data: {
// //                 name: user.name,  // Replace with actual user name
// //                 text: text,
// //                 avatar: user.avatar  // Replace with actual avatar URL
// //             }
// //         };
// //         ws.send(JSON.stringify(messageData)); // Send the message data
// //         setInput(''); // Clear the input field
// //     }
// // };

//   const renderItem = ({ item }) => (
//     <View style={styles.messageContainer}>
//       <Image style={{width: 50, height: 50}} source={{uri: item.avatar}} resizeMode='cover'/>
//       <View>
//       <Text style={styles.messageAuthor}>{item.name}</Text>
//       <Text style={styles.messageText}>{item.text}</Text>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         data={messages}
//         keyExtractor={(item) => item._id}
//         renderItem={renderItem}
//         contentContainerStyle={styles.messageList}
//       />
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Type your message..."
//           value={text}
//           onChangeText={setText}
//         />
//         <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//           <Text style={styles.sendButtonText}>Send</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f0f0f0',
//   },
//   messageList: {
//     paddingBottom: 20,
//   },
//   messageContainer: {
//     padding: 10,
//     borderRadius: 10,
//     marginVertical: 5,
//     marginHorizontal: 10,
//     backgroundColor: '#fff',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     shadowOffset: { width: 0, height: 1 },
//     flexDirection: "row",
//     gap: 20,
//   },
//   messageAuthor: {
//     fontWeight: 'bold',
//     marginTop: 5,
//   },
//   messageText: {
//     fontSize: 16,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#ccc',
//   },
//   input: {
//     flex: 1,
//     padding: 10,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     marginRight: 10,
//   },
//   sendButton: {
//     backgroundColor: '#007bff',
//     borderRadius: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//   },
//   sendButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

// export default ChatScreen;
