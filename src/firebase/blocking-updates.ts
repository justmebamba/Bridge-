'use client';
    
import {
  addDoc,
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates an addDoc operation for a collection reference.
 * Awaits the write operation internally and returns the DocumentReference.
 */
export async function addDocument(colRef: CollectionReference, data: any): Promise<DocumentReference> {
  try {
    const docRef = await addDoc(colRef, data);
    return docRef;
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: data,
      })
    );
    // Re-throw the error after emitting so the caller can handle it if needed.
    throw error;
  }
}
