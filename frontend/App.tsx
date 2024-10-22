import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/components/Login';
import ChatScreen from './src/components/ChatScreen';
import { Provider } from 'react-redux';
import store from './src/features/store';

const App = () => {

    const Stack = createNativeStackNavigator();
    return (
        <Provider store={store}>
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Chat" component={ChatScreen} />
            </Stack.Navigator>
        </NavigationContainer>
        </Provider>
    )
}

export default App