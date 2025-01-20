import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Text, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import Login from './screens/Login';
import Register from './screens/auth/Register';
import Home from './screens/Home';
import GenerateQR from './screens/GenerateQR';
import Guest from './screens/Guest';
import GuestLog from './screens/guest_inquire';
import GuestHistory from './screens/sidebar/guest_inquire_log';
import Profile from './screens/profile';
import ProfileEdit from './screens/profile_edit.js';
import Create from './screens/Create_Acc';
import CheckPayment from './screens/CheckPayment';
import Announcement from './screens/sidebar/announcement';
import Inbox from './screens/sidebar/inbox';
import GuestList from './screens/sidebar/guest_list';
import AddGuest from './screens/sidebar/add_guest';
import List_reservation from './screens/sidebar/visit_reservation_list';
import Bill_log from './screens/sidebar/billLog';
import a_details from './screens/sidebar/A_visit_details';
import Maintenance from './screens/sidebar/maintenance_request';
import compose_blog from './screens/sidebar/compose_blog';
import MaintenanceLog from './screens/sidebar/maintenance_request_log';
import InquireLog from './screens/guest_inquire';
import AcceptedGuest from './screens/option/AcceptedGuest';
import DenyGuest from './screens/option/deny_guest';
import CommunityForum from './screens/CommunityForum';
import PostDetail from './screens/PostDetail';
import GuardLogin from './guard/GuardLogin';
import guard_verify_otp from './guard/guard_verify_otp';
import guard_HO_Very from './guard/guard_HO_Very';
import guard_OTP from './guard/guard_OTP.js';
import TodayGuest from './guard/GuestList';
import guard_ho_qr from './guard/guard_ho_qr';
import GuestInfo from './guard/GuestInfo';
import Loading from './screens/utils/Loading.js';


import { UserProvider } from './screens/UserContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: '#f8f8f8', // Background color of the tab bar
          paddingBottom: 5, // Add some padding at the bottom
          height: 60, // Height of the tab bar
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home-outline'; // Correct icon for Home
              break;
            case 'My Qr':
              iconName = 'qr-code'; // Correct icon for QR Code
              break;
            case 'Visit Request':
              iconName = 'people-outline'; // Use 'people-outline' for Visit Request
              break;
            case 'Bills':
              iconName = 'wallet-outline'; // Use 'wallet-outline' for Bills
              break;
            default:
              iconName = 'information-circle-outline'; // Default icon
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: ({ focused }) => (
          <Text
            style={{
              textAlign: 'center',
              color: focused ? '#007AFF' : '#8e8e93', // Color change based on focus
              fontWeight: focused ? 'bold' : 'normal', // Bold text when focused
            }}
          >
            {route.name}
          </Text>
        ),
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="My Qr" component={GenerateQR} />
      <Tab.Screen name="Visit Request" component={GuestLog} />
      <Tab.Screen name="Bills" component={CheckPayment} />
    </Tab.Navigator>
  );
}



const App = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS === 'android') {
        // Create a notification channel for announcements
        await Notifications.setNotificationChannelAsync('announcement-channel', {
          name: 'Announcement Channel',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Request permissions for notifications
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };

    setupNotifications();

    // Add notification received listener
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    return () => subscription.remove();
  }, []);

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={Profile} options={{ title: 'Profile' }} />
          <Stack.Screen name="ProfileEdit" component={ProfileEdit} options={{ headerShown: false  }} />
          <Stack.Screen name="Create" component={Create} options={{ headerShown: false }} />
          <Stack.Screen name="Announcement" component={Announcement} options={{ title: 'Announcement' }} />
          <Stack.Screen name="Inbox" component={Inbox} options={{ title: 'Inbox' }} />
          <Stack.Screen name="Guest_list" component={GuestList} options={{ title: 'Today Guest' }} />
          <Stack.Screen name="a_details" component={a_details} options={{ title: 'Guest Details' }} />
          <Stack.Screen name="Guest" component={Guest} options={{ headerShown: false }} />
          <Stack.Screen name="Maintenance" component={Maintenance} options={{ title: 'Maintenance Request' }} />
          <Stack.Screen name="Maintenance_log" component={MaintenanceLog} options={{ title: 'Maintenance Request Log' }} />
          <Stack.Screen name="Guest_history" component={GuestHistory} options={{ title: 'Guest Visit Log' }} />
          <Stack.Screen name="AddGuest" component={AddGuest} options={{ title: 'Add Guest' }} />
          <Stack.Screen name="List_reservation" component={List_reservation} options={{ title: 'Visit History' }} />
          <Stack.Screen name="Gues tAccepted" component={AcceptedGuest} options={{ title: 'Guest Accepted' }} />
          <Stack.Screen name="DenyGuest" component={DenyGuest} options={{ title: 'Deny Guest' }} />
          <Stack.Screen name="CommunityForum" component={CommunityForum} options={{ title: 'Community Forum' }} />
          <Stack.Screen name="compose_blog" component={compose_blog} options={{ title: 'Compose Blog' }} />
          <Stack.Screen name="PostDetail" component={PostDetail} options={{ title: 'Post Detail' }} />
          <Stack.Screen name="Inquire_log" component={InquireLog} options={{ title: 'Guest Inquire Log' }} />
          <Stack.Screen name="GuardLogin" component={GuardLogin} options={{ headerShown: false }} />
          <Stack.Screen name="guard_verify_otp" component={guard_verify_otp} options={{ headerShown: false }} />
          <Stack.Screen name="guard_HO_Very" component={guard_HO_Very} options={{ headerShown: false }} />
          <Stack.Screen name="guard_OTP" component={guard_OTP} options={{ headerShown: false }} />
          <Stack.Screen name="TodayGuest" component={TodayGuest} options={{ title: 'Today Expected Guest' }} />
          <Stack.Screen name="guard_ho_qr" component={guard_ho_qr} options={{ title: 'Qr Scan' }} />
          <Stack.Screen name="GuestInfo" component={GuestInfo} options={{ title: 'Guest Info' }} />
          <Stack.Screen name="Bill_log" component={Bill_log} options={{ title: 'Bill Log' }} />
          <Stack.Screen name="Loading" component={Loading} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
