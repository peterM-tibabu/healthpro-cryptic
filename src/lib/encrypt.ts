import forge from "node-forge";

export function encryptDataWithRSA_AES(payload: object, publicKeyPem: string): string {
    const jsonData = JSON.stringify(payload);

    // Generate AES key (256-bit) and IV (16 bytes)
    const aesKey = forge.random.getBytesSync(32);
    const iv = forge.random.getBytesSync(16);

    // AES Encryption
    const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(jsonData, "utf8"));
    cipher.finish();
    const encryptedJsonData = forge.util.encode64(cipher.output.getBytes());

    if (!publicKeyPem) {
        throw new Error("Public key is not defined");
    }
    const trimmedPublicKeyPem = publicKeyPem.trim();
    
    // RSA Encryption for AES key and IV
    const publicKey = forge.pki.publicKeyFromPem(trimmedPublicKeyPem);
    const encryptedAesKey = forge.util.encode64(
        publicKey.encrypt(forge.util.encode64(aesKey), "RSA-OAEP")
    );
    const encryptedIv = forge.util.encode64(
        publicKey.encrypt(forge.util.encode64(iv), "RSA-OAEP")
    );

    // Combine and return final result as base64
    const combined = `${encryptedAesKey}:${encryptedIv}:${encryptedJsonData}`;
    return forge.util.encode64(combined);
}

