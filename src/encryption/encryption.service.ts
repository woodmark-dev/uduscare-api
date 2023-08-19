import { Injectable } from '@nestjs/common';
import { toHex, utf8ToBytes, hexToBytes } from 'ethereum-cryptography/utils';
import * as secp from 'ethereum-cryptography/secp256k1';
import { encrypt, decrypt } from 'ethereum-cryptography/aes';

@Injectable()
export class EncryptionService {
  private pubkey = secp.getPublicKey(process.env.PRIVATE_KEY).slice(0, 16);
  private encryptionKey = hexToBytes(process.env.ENCRYPTION_KEY);
  private strategy = process.env.AES_STRATEGY;

  async getEncryptedText(text: string) {
    const message = utf8ToBytes(text);

    const encryptedText = await encrypt(
      message,
      this.pubkey,
      this.encryptionKey,
      this.strategy,
      true,
    );

    return toHex(encryptedText);
  }
  async getDecyptedText(hex: string) {
    const message = hexToBytes(hex);

    const result = await decrypt(
      message,
      this.pubkey,
      this.encryptionKey,
      this.strategy,
      true,
    );

    const buf = Buffer.from(result);
    return buf.toString();
  }
}
