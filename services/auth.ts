import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const googleProvider = new GoogleAuthProvider();

export const signInGoogle        = () => signInWithPopup(auth, googleProvider);
export const signInEmail         = (e: string, p: string) => signInWithEmailAndPassword(auth, e, p);
export const signUpEmail         = async (e: string, p: string, name: string) => {
  const cred = await createUserWithEmailAndPassword(auth, e, p);
  await updateProfile(cred.user, { displayName: name });
  return cred;
};
export const logOut              = () => signOut(auth);
export const onAuthChange        = (cb: (u: User | null) => void) => onAuthStateChanged(auth, cb);
