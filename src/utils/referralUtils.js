// src/utils/referralUtils.js
import { db } from '../firebase';
import { query, collection, where, getDocs, updateDoc } from 'firebase/firestore';

export const generateReferralCode = (role) => {
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${randomString}-${role.toUpperCase()}`;
};

export const validateReferralCode = async (code) => {
  try {
    // Check if code matches the format and exists in database
    const q = query(
      collection(db, 'referralCodes'),
      where('code', '==', code),
      where('used', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error validating referral code:', error);
    return false;
  }
};

export const markReferralCodeAsUsed = async (code) => {
  try {
    const q = query(
      collection(db, 'referralCodes'),
      where('code', '==', code)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, { used: true, usedAt: new Date() });
    }
  } catch (error) {
    console.error('Error marking referral code as used:', error);
  }
};