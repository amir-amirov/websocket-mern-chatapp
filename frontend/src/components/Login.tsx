import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Touchable, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/slices/userSlice';

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false); // Track whether to show sign-up or login

    const dispatch = useDispatch()

    const BASE_URL = 'http://192.168.100.3:3000';
    const defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/chat-app-e2ad2.appspot.com/o/images%2Favatar_icon.png?alt=media&token=2ae0cf20-afff-4f7f-9c3c-2b6d97f35fc8'
    const createUser = async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ _id: id, name: name, email: email, avatar: defaultAvatar }),
            });

            if (!response.ok) throw new Error('Failed to send message');
            dispatch(setUser({ _id: id, email, name, avatar: defaultAvatar }));
            setEmail('');
            setName('');
            setPassword('');

        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error sending message', error.message);
        }
    }
    const handleAuth = async () => {
        try {
            if (isSignUp) {
                // Sign up the user
                const userCredentials = await auth().createUserWithEmailAndPassword(email, password);
                const user = userCredentials.user

                console.log('Dispatching user data:', { email, name, avatar: defaultAvatar });
                await createUser(user.uid)
                Alert.alert('Account created!', 'Welcome to the app!');
            } else {
                // Log in the user
                await auth().signInWithEmailAndPassword(email, password);
                Alert.alert('Logged in!', 'Welcome back!');
            }
            navigation.navigate("Chat");
        } catch (error) {
            console.error(error);
            Alert.alert('Authentication error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter email.."
                placeholderTextColor="gray"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {isSignUp ? <TextInput
                style={styles.input}
                placeholder="Enter name.."
                placeholderTextColor="gray"
                value={name}
                onChangeText={setName}
            />
                : ""
            }
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="gray"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title={isSignUp ? 'Sign Up' : 'Login'} onPress={handleAuth} />
            <View style={{ marginTop: 20, flexDirection: "row", gap: 5 }}>
                {isSignUp ? <Text style={{color: "gray"}}>Already have an account?</Text> : <Text style={{color: "gray"}}>Would like to create an account?</Text>}
                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                    <Text style={{ color: "#007FFF" }}>Click here</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        color: "black",
    },
    input: {
        width: '100%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        color: "black"
    },
});

export default Login;
