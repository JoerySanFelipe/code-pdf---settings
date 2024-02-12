import { Injectable } from '@angular/core';
import { Firestore, collection, doc, orderBy, query, setDoc, writeBatch, deleteDoc } from '@angular/fire/firestore';
import { PaymentQr } from '../models/payments-qr';
import { Observable } from 'rxjs';
import { collectionData } from 'rxfire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { v4 as uuidv4 } from 'uuid';
import { ToastrService } from 'ngx-toastr';

const PAYMENT_QR_COLLECTION = 'PaymentQR';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private toastr: ToastrService
  ) {}

  async uploadPaymentQr(file: File) {
    try {
      const batch = writeBatch(this.firestore);
      const paymentQrId = uuidv4();
      const fireRef = ref(this.storage, `${PAYMENT_QR_COLLECTION}/${paymentQrId}`);
      await uploadBytes(fireRef, file);
      const downloadURL = await getDownloadURL(fireRef);
      let paymentQr: PaymentQr = {
        id: paymentQrId,
        qr: downloadURL,
        createdAt: new Date(),
      };
      const paymentQrDocRef = doc(this.firestore, PAYMENT_QR_COLLECTION, paymentQrId);
      batch.set(paymentQrDocRef, paymentQr);
      await batch.commit();
    } catch (error) {
      console.error('Error uploading file or adding payment QR:', error);
      this.toastr.error('Failed to upload payment QR code.');
      throw error;
    }
  }

  getAllPaymentQr(): Observable<PaymentQr[]> {
    const q = query(collection(this.firestore, PAYMENT_QR_COLLECTION), orderBy('createdAt', 'desc'));
    return collectionData(q) as Observable<PaymentQr[]>;
  }

  async deletePaymentQr(paymentQrId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, PAYMENT_QR_COLLECTION, paymentQrId));
    } catch (error) {
      console.error('Error deleting payment QR code:', error);
      this.toastr.error('Failed to delete payment QR code.');
      throw error;
    }
  }
}
