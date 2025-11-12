import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const createTestIDIQEnrollments = async () => {
  const enrollmentsRef = collection(db, 'idiqEnrollments');
  
  const testEnrollments = [
    {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "555-1234",
      status: "active",
      leadScore: 8,
      creditScore: 650,
      verified: true,
      contacted: true,
      aiInteraction: true,
      aiQuality: 8.5,
      aiSatisfaction: 9.0,
      escalated: false,
      resolved: true,
      responseTime: 45,
      sentimentScore: 8,
      fraudScore: 15,
      blocked: false,
      revenue: 150,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      phone: "555-5678",
      status: "completed",
      leadScore: 9,
      creditScore: 720,
      verified: true,
      contacted: true,
      aiInteraction: true,
      aiQuality: 9.2,
      aiSatisfaction: 9.5,
      escalated: false,
      resolved: true,
      responseTime: 30,
      sentimentScore: 9,
      fraudScore: 5,
      blocked: false,
      revenue: 150,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    // Add more test data as needed
  ];

  try {
    for (const enrollment of testEnrollments) {
      await addDoc(enrollmentsRef, enrollment);
    }
    console.log('Test IDIQ enrollments created successfully!');
  } catch (error) {
    console.error('Error creating test enrollments:', error);
  }
};

export const createTestCreditReports = async () => {
  const reportsRef = collection(db, 'creditReports');
  
  const testReports = [
    {
      clientId: "user123",
      clientName: "John Doe",
      clientEmail: "john@example.com",
      clientPhone: "555-1234",
      status: "new",
      priority: "high",
      currentScore: 680,
      initialScore: 620,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      archivedAt: null
    },
    {
      clientId: "user456",
      clientName: "Jane Smith",
      clientEmail: "jane@example.com",
      clientPhone: "555-5678",
      status: "in-progress",
      priority: "medium",
      currentScore: 720,
      initialScore: 680,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      archivedAt: null
    },
    // Add more test data as needed
  ];

  try {
    for (const report of testReports) {
      await addDoc(reportsRef, report);
    }
    console.log('Test credit reports created successfully!');
  } catch (error) {
    console.error('Error creating test reports:', error);
  }
};