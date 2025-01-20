import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Sidebar from './Sidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const GuestList = () => {
  const navigation = useNavigation();
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [guests, setGuests] = useState([]);
  const [user, setUser] = useState(null); // Add this line to define `user` state
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const { username } = JSON.parse(userData);
          const userResponse = await axios.get(`https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getuser.php?username=${username}`);
          setUser(userResponse.data); // Now this will work

          const visitResponse = await axios.get(`https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getVisit.php?username=${username}`);
          if (visitResponse.data.error) {
            setGuests([]);
          } else {
            setGuests(visitResponse.data);
          }
          setLoading(false);
        } else {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error("Failed to get user data:", error);
        navigation.navigate('Login');
      }
    };

    getUserData();

    const intervalId = setInterval(() => {
      getUserData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      navigation.navigate('Login');
    } catch (error) {
      console.error("Failed to remove user data:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.guestItem}>
       <Image 
              source={{ uri: `https://darkorchid-caribou-718106.hostingersite.com/image/${item.Guest_photo}` }} 
              style={styles.profileImage} 
            />
      <View style={styles.guestInfo}>
        <Text style={styles.guestName}>
          {`${item.Guest_lname}, ${item.Guest_fname} ${item.Guest_mname ? item.Guest_mname + ' ' : ''}${item.Guest_afname || ''}`}
        </Text>
        <Text style={styles.guestDetail}>
          <Icon name="place" size={16} color="#888" /> {item.guest_add}
        </Text>
        <Text style={styles.guestDetail}>
          <Icon name="event" size={16} color="#888" /> {item.visit_date}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.statusButton}
        onPress={() => navigation.navigate('Guest', { guest: item })}
      >
        <Text style={styles.statusButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  const imageUrl = user && user.ho_pic ? `https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/${user.ho_pic}` : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Guest List</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.profileImage} />
          ) : (
            <Icon name="person" size={40} color="#fff" /> // Placeholder icon if no image
          )}
        </TouchableOpacity>
      </View>

      {isSidebarVisible && <Sidebar onClose={toggleSidebar} navigation={navigation} />}

      <View style={styles.content}>
        {guests.length === 0 ? (
          <View style={styles.noVisitorContainer}>
            <Text style={styles.noVisitorText}>No Visitor</Text>
          </View>
        ) : (
          <FlatList
            data={guests}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.guestList}
          />
        )}
      </View>
    </View>
  );
};

export default GuestList;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'rgb(10, 80, 57)',
    marginTop: 30,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 3,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  guestList: {
    marginTop: 10,
  },
  guestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  guestInfo: {
    flex: 1,
    marginLeft: 10,
  },
  guestName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  guestDetail: {
    fontSize: 14,
    color: '#888',
  },
  guestImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statusButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: 'rgb(10, 80, 57)',
    elevation: 2,
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noVisitorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVisitorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#aaa',
  },
});