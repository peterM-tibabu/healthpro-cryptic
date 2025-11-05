import forge from "node-forge";

export function decryptDataWithRSA_AES(encrypted: string, privateKeyPem: string): object {
    if (!privateKeyPem) {
        throw new Error("Private key is not defined");
    }
    const trimmedPrivateKeyPem = privateKeyPem.trim();

    const privateKey = forge.pki.privateKeyFromPem(trimmedPrivateKeyPem);

    // Decode base64 and split encrypted parts
    const decodedCombined = forge.util.decode64(encrypted);
    const [encryptedAesKey, encryptedIv, encryptedData] =
        decodedCombined.split(":");

    if (!encryptedAesKey || !encryptedIv || !encryptedData) {
        throw new Error("Encrypted data format is invalid");
    }

    // Decrypt AES key and IV
    const aesKey = forge.util.decode64(
        privateKey.decrypt(forge.util.decode64(encryptedAesKey), "RSA-OAEP")
    );
    const iv = forge.util.decode64(
        privateKey.decrypt(forge.util.decode64(encryptedIv), "RSA-OAEP")
    );

    // AES decrypt JSON
    const encryptedBytes = forge.util.decode64(encryptedData);
    const buffer = forge.util.createBuffer(encryptedBytes, "raw");
    const decipher = forge.cipher.createDecipher("AES-CBC", aesKey);
    decipher.start({ iv });
    decipher.update(buffer);

    if (!decipher.finish()) {
        throw new Error("AES decryption failed");
    }

    return JSON.parse(decipher.output.toString());
}

