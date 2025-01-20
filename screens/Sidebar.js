import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const Sidebar = ({ onClose }) => {
  const navigation = useNavigation();

  const navigateToScreen = (screenName) => {
    onClose();
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>NEIGBOREASE</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContainer}>
        {/* Inbox Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.item} onPress={() => navigateToScreen('Announcement')}>
            <Icon name="announcement" size={24} color="#9C27B0" />
            <Text style={styles.itemText}>Announcement</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigateToScreen('CommunityForum')}>
            <Icon name="forum" size={24} color="#9C27B0" />
            <Text style={styles.itemText}>Community Thread</Text>
          </TouchableOpacity>
          {/* Uncomment if you want to add Inbox */}
          {/* <TouchableOpacity style={styles.item} onPress={() => navigateToScreen('Inbox')}>
            <Icon name="mail" size={24} color="#4CAF50" />
            <Text style={styles.itemText}>Inbox</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>24</Text>
            </View>
          </TouchableOpacity> */}
        </View>

        {/* Guest Section */}
        <View style={styles.section}>
          {/* <Text style={styles.sectionHeader}>Guest</Text>
           <TouchableOpacity style={styles.item} onPress={() => navigateToScreen('Guest_list')}>
            <Icon name="people" size={24} color="#FF4081" />
            <Text style={styles.itemText}>Today Guest</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Visit Request')}>
            <Icon name="person-search" size={24} color="#FF4081" />
            <Text style={styles.itemText}>Guests Inquire</Text>
          </TouchableOpacity>
         
          <TouchableOpacity style={styles.item} onPress={() => navigateToScreen('AddGuest')}>
            <Icon name="people" size={24} color="#FF4081" />
            <Text style={styles.itemText}>Add Guest</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigateToScreen('List_reservation')}>
            <Icon name="people" size={24} color="#FF4081" />
            <Text style={styles.itemText}>Visit History</Text>
          </TouchableOpacity>
        </View>

        {/* Bill Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Bill</Text>
          <TouchableOpacity style={styles.item} onPress={() => navigateToScreen('Bills')}>
            <Icon name="receipt" size={24} color="#FF9800" />
            <Text style={styles.itemText}>Upcoming Bill/s</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigateToScreen('Bill_log')}>
            <Icon name="history" size={24} color="#FF9800" />
            <Text style={styles.itemText}>Bill Log</Text>
          </TouchableOpacity>
        </View>

        {/* Miscellaneous Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Miscellaneous</Text>
          <TouchableOpacity style={styles.item} onPress={() => navigateToScreen('Maintenance')}>
            <Icon name="build" size={24} color="#FFEB3B" />
            <Text style={styles.itemText}>Issue a maintenance request</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigateToScreen('Maintenance_log')}>
            <Icon name="assignment-turned-in" size={24} color="#03A9F4" />
            <Text style={styles.itemText}>Request Status</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.item} onPress={() => navigateToScreen('GuardLogin')}>
            <Icon name="security" size={24} color="#9C27B0" />
            <Text style={styles.itemText}>Guard Login</Text>
          </TouchableOpacity> */}
          
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 260,
    backgroundColor: 'rgb(247,246,237)',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    zIndex: 1000,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgb(10, 80, 57)',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,  // Ensure it takes the available space
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 3,
  },
  itemText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 16,
  },
  badge: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 'auto',
  },
  badgeText: {
    fontSize: 14,
    color: '#fff',
  },
});

export default Sidebar;
