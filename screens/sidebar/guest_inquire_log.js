import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

const GuestList = () => {
  const [guests, setGuests] = useState([]);

  useEffect(() => {
    // Fetch data from API endpoint
    fetch('http://your-api-endpoint.com/visits?username=YOUR_USERNAME')
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.log(data.error);
        } else {
          // Update guests data with the response
          const formattedGuests = data.map(item => ({
            id: item.id,
            name: `${item.Guest_fname} ${item.Guest_mname ? item.Guest_mname + ' ' : ''}${item.Guest_lname}`,
            address: item.guest_add,
            date: item.visit_date,
            status: item.status,
            image: item.Guest_photo || 'https://via.placeholder.com/100', // default image if none
          }));
          setGuests(formattedGuests);
        }
      })
      .catch(error => console.error('Error fetching guests:', error));
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.guestItem}>
      <Image source={{ uri: item.image }} style={styles.guestImage} />
      <View style={styles.guestInfo}>
        <Text style={styles.guestName}>{item.name}</Text>
        <Text style={styles.guestAddress}>{item.address}</Text>
        <Text style={styles.guestDate}>{item.date}</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.statusButton,
          { backgroundColor: item.status === 'Accepted' ? '#4CAF50' : '#F44336' }
        ]}
      >
        <Text style={styles.statusButtonText}>{item.status}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Guest List</Text>
      <FlatList
        data={guests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.guestList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  guestAddress: {
    fontSize: 14,
    color: '#888',
  },
  guestDate: {
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
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GuestList;
