'use client';
    
import {
  addDoc,
  setDoc,
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates an addDoc operation for a collection reference.
 * Awaits the write operation internally and returns the DocumentReference.
 */
export async function addDocument(docRef: DocumentReference | CollectionReference, data: any): Promise<DocumentReference> {
  try {
    if (docRef.type === 'collection') {
        const newDocRef = await addDoc(docRef, data);
        return newDocRef;
    } else {
        await setDoc(docRef, data);
        return docRef as DocumentReference;
    }
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: data,
      })
    );
    // Re-throw the error after emitting so the caller can handle it if needed.
    throw error;
  }
}
