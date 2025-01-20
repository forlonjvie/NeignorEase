import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Sidebar from './Sidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

const Guest = ({ route, navigation }) => {
  const { guest } = route.params; // Guest details from route params
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [username, setUsername] = useState(''); // Store username
  const [showDatePicker, setShowDatePicker] = useState(false); // Date picker visibility
  const [validity, setValidity] = useState(new Date()); // Default validity to today's date

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUsername(parsedData.username); // Set username from stored data
        } else {
          navigation.navigate('Login'); // Redirect to login if no user data
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigation.navigate('Login');
      }
    };
    fetchUserData();
  }, [navigation]);

  const toggleSidebar = () => setSidebarVisible(prevState => !prevState);

  const handleAccept = async () => {
    if (!guest || !username) {
      console.error('Missing guest or user details');
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const postData = {
      guestName: `${guest.Guest_lname.replace(/ /g, '_')}_${guest.Guest_fname.replace(/ /g, '_')}_${guest.Guest_mname ? guest.Guest_mname.replace(/ /g, '_') + '_' : ''}${guest.Guest_afname ? guest.Guest_afname.replace(/ /g, '_') : ''}`,
      guestEmail: guest.Guest_email,
      guestContact: guest.guest_contact,
      hoName: username,
      hoHousenum: guest.guest_add,
      arrival: guest.visit_date,
      otp: otp,
      validity: validity.toISOString().split('T')[0], // Use the selected validity date
    };

    try {
      const response = await axios.post('https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/post_confirmed_guest.php', postData);

      if (response.status === 200) {
        console.log('Guest confirmed successfully:', response.data);
        navigation.navigate('Visit Request');
      } else {
        console.error('Failed to confirm guest:', response.data);
      }
    } catch (error) {
      console.error('Error confirming guest:', error);
    }
  };

  // const handleDeny = () => {
  //   console.log('Guest denied');
  //   navigation.navigate('DenyGuest');
  // };
  const handleDeny = async () => {
    if (!guest || !username) {
      console.error("Missing guest or user details");
      return;
    }
  
    // Construct the guest name properly
    const guestName = `${guest.Guest_lname.replace(/ /g, '_')}_${guest.Guest_fname.replace(/ /g, '_')}${
      guest.Guest_mname ? '_' + guest.Guest_mname.replace(/ /g, '_') : ''
    }${guest.Guest_afname ? '_' + guest.Guest_afname.replace(/ /g, '_') : ''}`;
  
    const postData = {
      guestName: guestName,
      guestEmail: guest.Guest_email,
      guestContact: guest.guest_contact,
      hoName: username,
      hoHousenum: guest.guest_add,
    };
  
    try {
      const response = await axios.post(
        "https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/post_deny_guest.php",
        postData
      );
  
      if (response.data?.status === "success") {
        console.log("Deny Request Successful:", response.data);
        alert("Guest request denied successfully.");
        navigation.navigate("Visit Request");
      } else {
        console.error("Failed to deny guest:", response.data?.message || "Unknown error");
        alert(response.data?.message || "Failed to deny guest.");
      }
    } catch (error) {
      console.error("Error denying guest:", error);
      alert("An error occurred while denying the guest request. Please try again.");
    }
  };
  

  const navigateToProfile = () => navigation.navigate('Profile');

  const handleBackPress = () => navigation.goBack();

  const showDatePickerModal = () => {
    setShowDatePicker(true); // Show the date picker when called
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && selectedDate >= new Date()) {
      setValidity(selectedDate); // Set validity date only if it's today or later
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Verify Inquiry</Text>
        <TouchableOpacity onPress={navigateToProfile}>
          <Image source={require('../assets/man.png')} style={styles.userImage} />
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      {isSidebarVisible && <Sidebar onClose={toggleSidebar} navigation={navigation} />}

{/* Main Content */}
<View style={styles.content}>
  <View style={styles.card}>
    {/* Updated Image with Dynamic URL */}
    {guest && (
      <Image 
        source={{ uri: `https://darkorchid-caribou-718106.hostingersite.com/image/${guest.Guest_photo}` }} 
        style={styles.profileImage} 
      />
    )}

    {/* Guest Details */}
    {guest && (
      <>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>
            {guest.Guest_lname}, {guest.Guest_fname} {guest.Guest_mname ? guest.Guest_mname + ' ' : ''}{guest.Guest_afname ? guest.Guest_afname : ''}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{guest.Guest_email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Contact:</Text>
          <Text style={styles.value}>{guest.guest_contact}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{guest.guest_add}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Relation:</Text>
          <Text style={styles.value}>{guest.relation}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Expected Arrival:</Text>
          <Text style={styles.value}>{guest.visit_date}</Text>
        </View>

        {/* Date Picker */}
        <View style={styles.infoItem}>
          <Text style={styles.label}>Validity Date:</Text>
          <TouchableOpacity onPress={showDatePickerModal} style={styles.datePickerButton}>
            <Text style={styles.datePickerText}>{validity.toDateString()}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={validity}
            mode="date"
            display="default"
            minimumDate={new Date()} // Prevent selecting previous dates
            onChange={handleDateChange}
          />
        )}
      </>
    )}

    {/* Action Buttons */}
    <View style={styles.buttons}>
      <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={handleAccept}>
        <Text style={styles.buttonText}>Accept</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.denyButton]} onPress={handleDeny}>
        <Text style={styles.buttonText}>Deny</Text>
      </TouchableOpacity>
    </View>
  </View>
</View>

    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#0A5039', marginTop: 30, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  userImage: { width: 40, height: 40, borderRadius: 20 },
  content: { flex: 1, padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, elevation: 3 },
  profileImage: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 20 },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  label: { fontWeight: 'bold', fontSize: 16 },
  value: { fontSize: 16 },
  datePickerButton: { padding: 10, backgroundColor: '#e0e0e0', borderRadius: 5 },
  datePickerText: { fontSize: 16 },
  buttons: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  button: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 },
  acceptButton: { backgroundColor: '#4CAF50' },
  denyButton: { backgroundColor: '#F44336' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});


export default Guest;
